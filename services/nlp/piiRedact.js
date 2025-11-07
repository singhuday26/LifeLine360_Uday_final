const EMAIL_REGEX = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi;
const PHONE_REGEX = /(?:\+\d{1,3}[ -]?)?(?:\d[ -]?){7,12}\d/g;
const AADHAAR_REGEX = /\b\d{4}\s?\d{4}\s?\d{4}\b/g;

function maskMatch(match) {
    return '*'.repeat(Math.min(match.length, 12));
}

async function piiRedact(text) {
    if (!text || typeof text !== 'string') {
        return '';
    }

    let sanitized = text.replace(EMAIL_REGEX, maskMatch);
    sanitized = sanitized.replace(PHONE_REGEX, maskMatch);
    sanitized = sanitized.replace(AADHAAR_REGEX, maskMatch);

    return sanitized;
}

module.exports = {
    piiRedact
};
