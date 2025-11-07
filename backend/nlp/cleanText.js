const { detectLanguage } = require('../../services/nlp/languageDetect');
const { redactPII } = require('../../services/nlp/piiRedact');
const { normalize } = require('../../services/nlp/normalize');

/**
 * Runs language detection, PII masking, and normalization in sequence.
 * Returns every intermediate artefact for auditing.
 */
async function cleanText(rawText) {
    const lang = await detectLanguage(rawText);
    const redacted = redactPII(rawText);
    const normalized = normalize(redacted);

    return {
        lang,
        redacted,
        normalized,
        tokens: normalized ? normalized.split(' ') : []
    };
}

module.exports = {
    cleanText
};
