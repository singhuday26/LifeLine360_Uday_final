function normalize(text) {
    return (text || '')
        .replace(/https?:\/\/\S+/g, '')
        .replace(/[@#][A-Za-z0-9_]+/g, '')
        .replace(/[^\w\s]/g, ' ')
        .replace(/\s+/g, ' ')
        .toLowerCase()
        .trim();
}

module.exports = {
    normalize
};
