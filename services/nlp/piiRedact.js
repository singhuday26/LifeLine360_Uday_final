function redactPII(text) {
    if (!text) return text;

    return text
        .replace(/\b\d{10}\b/g, '**********')
        .replace(/\S+@\S+\.\S+/g, '***@***')
        .replace(/\b\d{4}\s\d{4}\s\d{4}\b/g, '*** *** ***')
        .trim();
}

module.exports = {
    redactPII
};
