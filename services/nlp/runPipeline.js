const { detectLanguage } = require('./languageDetect');
const { redactPII } = require('./piiRedact');
const { normalize } = require('./normalize');
const { extractEntities } = require('./entityExtract');
const { classifyUrgency } = require('./urgencyClassify');
const { getMessageHash } = require('./dedupeCluster');
const { correlateWithSensors } = require('./correlateWithSensors');
const { applyRules } = require('./ruleEngine');

async function runNlpPipeline(comm) {
    const lang = detectLanguage(comm.text);
    const redacted = redactPII(comm.text);
    const clean = normalize(redacted);
    const entities = extractEntities(clean);
    const urgency = classifyUrgency(entities);
    const hash = getMessageHash(clean);

    const sensorResult = await correlateWithSensors({
        lat: comm.lat ?? comm.rawLat,
        lon: comm.lon ?? comm.rawLng,
        timestamp: comm.createdAt || Date.now()
    });

    const rules = applyRules({ entities, urgency, sensorResult });

    return {
        lang,
        entities,
        urgency,
        sensorResult,
        finalScore: rules.finalScore,
        severity: rules.severity,
        hash
    };
}

module.exports = {
    runNlpPipeline
};
