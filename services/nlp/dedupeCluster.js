const crypto = require('crypto');

// Simple MinHash implementation for text similarity
function shingle(text, k = 3) {
    const cleaned = text.replace(/[^a-z0-9\s]/gi, ' ').toLowerCase();
    const words = cleaned.split(/\s+/).filter(Boolean);
    const shingles = [];
    for (let i = 0; i <= words.length - k; i++) {
        shingles.push(words.slice(i, i + k).join(' '));
    }
    return shingles;
}

function minHash(shingles, numHashes = 100) {
    const hashes = [];
    for (let i = 0; i < numHashes; i++) {
        let min = Infinity;
        for (const shingle of shingles) {
            const hash = crypto.createHash('md5').update(shingle + i).digest('hex');
            const numHash = parseInt(hash.substring(0, 8), 16);
            if (numHash < min) min = numHash;
        }
        hashes.push(min);
    }
    return hashes.join(',');
}

function getMessageHash(text) {
    if (!text || typeof text !== 'string') return null;
    const shingles = shingle(text);
    if (shingles.length === 0) return null;
    return minHash(shingles);
}

module.exports = {
    getMessageHash
};
