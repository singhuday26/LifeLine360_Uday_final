const { franc } = require('franc');

function detectLanguage(text) {
    const langCode = franc(text || '', { minLength: 3 });
    return langCode === 'und' ? 'unknown' : langCode;
}

module.exports = {
    detectLanguage
};
