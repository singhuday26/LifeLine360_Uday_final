const { correlateWithSensors } = require('../../services/nlp/correlateWithSensors');

/**
 * Delegates to the core correlation logic while keeping the call-site readable
 * for controllers/services living under backend/nlp.
 */
async function correlateEvidence(payload) {
    return correlateWithSensors(payload);
}

module.exports = {
    correlateEvidence
};
