const { extractEntities: baseExtractEntities } = require('../../services/nlp/entityExtract');

/**
 * Executes entity extraction and normalises the response for downstream usage.
 * Provides quick lookups for specific entity buckets required by the pipeline.
 */
function extractEntities(text) {
    const entities = baseExtractEntities(text || '') || { hazards: [], needs: [], victims: false };

    return {
        entities,
        buckets: {
            hazards: entities.hazards || [],
            needs: entities.needs || [],
            victims: entities.victims || false
        }
    };
}

module.exports = {
    extractEntities
};
