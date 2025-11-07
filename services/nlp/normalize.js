function normalizeText(text, lang = 'en') {
    if (!text || typeof text !== 'string') {
        return '';
    }

    const lower = text.toLowerCase();
    const withoutUrls = lower.replace(/https?:\/\/\S+/g, ' ');
    const withoutHandles = withoutUrls.replace(/@[\w_]+/g, ' ');
    const withoutHashtags = withoutHandles.replace(/#[\w_]+/g, ' ');
    const collapsed = withoutHashtags.replace(/[^a-z0-9\s.,!?\-]/g, ' ');
    return collapsed.replace(/\s+/g, ' ').trim();
}

module.exports = {
    normalizeText
};
