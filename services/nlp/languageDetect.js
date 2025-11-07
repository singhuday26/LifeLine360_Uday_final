const franc = require('franc');
const iso6393 = require('iso-639-3');
const logger = require('../../middleware/logger');

const ISO_MAP = new Map();
for (const entry of iso6393) {
    if (entry.iso6393 && entry.iso6391) {
        ISO_MAP.set(entry.iso6393, entry.iso6391);
    }
}

async function detectLanguage(text) {
    try {
        if (!text || typeof text !== 'string') {
            return 'und';
        }

        const francCode = franc(text, { minLength: 3 });
        const iso1 = ISO_MAP.get(francCode);
        return iso1 || 'und';
    } catch (error) {
        logger.warn('Language detection failed, defaulting to und', { error: error.message });
        return 'und';
    }
}

module.exports = {
    detectLanguage
};
