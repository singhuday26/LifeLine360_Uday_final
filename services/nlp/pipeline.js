const crypto = require('crypto');
const Communication = require('../../models/Communication');
const NlpExtraction = require('../../models/NlpExtraction');
const logger = require('../../middleware/logger');
const { sectorize } = require('../../utils/sectorIndex');
const { detectLanguage } = require('./languageDetect');
const { piiRedact } = require('./piiRedact');
const { normalizeText } = require('./normalize');
const { extractEntities, detectHazards } = require('./entityExtract');
const { extractLocation } = require('./locationExtract');
const { classifyUrgency } = require('./urgencyClassify');
const { clusterNearDuplicates } = require('./dedupeCluster');
const { geocodeIfNeeded } = require('../geo/geocode');
const { correlateWithSensorsAndUpsertCandidate } = require('./correlateWithSensors');

function hashText(text) {
    if (!text) {
        return null;
    }
    return crypto.createHash('sha256').update(text).digest('hex');
}

async function runNlpPipeline(comm) {
    if (!comm) {
        throw new Error('Communication document required');
    }

    logger.info('Running NLP pipeline', { commId: comm._id.toString() });

    const lang = await detectLanguage(comm.text);
    const redacted = await piiRedact(comm.text);
    const normalized = normalizeText(redacted, lang);
    const entities = extractEntities(normalized);
    const location = extractLocation(normalized, entities);
    const geo = await geocodeIfNeeded(location, comm.rawLat, comm.rawLng);
    const sectorId = sectorize(geo?.lat, geo?.lng) || comm.sectorId || null;
    const hazards = detectHazards(normalized, entities);
    const urgency = classifyUrgency(normalized, entities);
    const dedupeGroupId = await clusterNearDuplicates(normalized);

    const extraction = await NlpExtraction.create({
        commId: comm._id,
        tokens: normalized.split(' '),
        entities,
        hazards,
        urgency,
        geo,
        sectorId,
        dedupeGroupId,
        explanation: null
    });

    const candidate = await correlateWithSensorsAndUpsertCandidate({
        sectorId,
        geo,
        hazards,
        urgency,
        extractionId: extraction._id,
        commId: comm._id
    });

    const explanation = candidate?.explanation || null;
    if (explanation) {
        extraction.explanation = explanation;
        await extraction.save();
    }

    await Communication.updateOne({ _id: comm._id }, {
        $set: {
            processed: true,
            lang,
            piiRedactedText: redacted,
            sectorId,
            textHash: hashText(comm.text)
        }
    });

    return { extraction, candidate };
}

module.exports = {
    runNlpPipeline
};
