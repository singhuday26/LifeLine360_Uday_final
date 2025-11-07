const { extractEntities } = require('../../services/nlp/entityExtract');

function tagHazards(text, options = {}) {
    const entities = extractEntities(text || '');
    const hazards = entities.hazards || [];

    const primary = hazards.length ? { label: hazards[0], confidence: options.primaryConfidence || 0.6 } : null;

    return {
        hazards,
        primaryHazard: primary,
        hydrated: Boolean(primary)
    };
}

module.exports = {
    tagHazards
};
