const hazardKeywords = ['flood', 'fire', 'landslide', 'gas', 'earthquake'];
const needKeywords = ['help', 'rescue', 'urgent', 'stuck', 'injured'];

function extractEntities(text) {
    const safeText = (text || '').toLowerCase();
    const hazards = hazardKeywords.filter(keyword => safeText.includes(keyword));
    const needs = needKeywords.filter(keyword => safeText.includes(keyword));

    return {
        hazards,
        needs,
        victims: /\b(\d+)\s*(people|persons|injured|trapped)\b/.test(safeText)
    };
}

module.exports = {
    extractEntities
};
