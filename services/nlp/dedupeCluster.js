const crypto = require('crypto');

function shingle(text) {
    const cleaned = text.replace(/[^a-z0-9\s]/gi, ' ').toLowerCase();
    return cleaned.split(/\s+/).filter(Boolean).slice(0, 20).join(' ');
}

async function clusterNearDuplicates(text) {
    if (!text) {
        return null;
    }
    const base = shingle(text);
    return crypto.createHash('sha1').update(base).digest('hex').slice(0, 12);
}

module.exports = {
    clusterNearDuplicates
};
