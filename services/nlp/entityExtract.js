const hazardKeywords = {
    FIRE: ['fire', 'smoke', 'flames', 'burning', 'burned'],
    FLOOD: ['flood', 'water logging', 'waterlogged', 'overflow', 'submerged'],
    GAS_LEAK: ['gas leak', 'gas smell', 'leakage', 'chemical smell'],
    HEATWAVE: ['heatwave', 'extreme heat', 'heat stroke', 'scorching'],
    LANDSLIDE: ['landslide', 'mudslide', 'rockfall', 'slope failure'],
    EARTHQUAKE: ['earthquake', 'tremor', 'aftershock', 'quaking']
};

const needKeywords = ['help', 'assistance', 'rescue', 'medical', 'ambulance'];
const resourceKeywords = ['water', 'food', 'blanket', 'medicine', 'shelter'];
const victimKeywords = ['people trapped', 'trapped', 'injured', 'missing'];
const locationIndicators = ['near', 'at', 'in', 'around', 'beside'];

function findKeywordEntities(text, keywordList, type, confidence = 0.6) {
    const matches = [];
    for (const keyword of keywordList) {
        const regex = new RegExp(`\\b${keyword.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&')}\\b`, 'gi');
        let match;
        while ((match = regex.exec(text)) !== null) {
            matches.push({
                type,
                value: keyword,
                start: match.index,
                end: match.index + keyword.length,
                confidence
            });
        }
    }
    return matches;
}

function extractEntities(text) {
    if (!text) {
        return [];
    }

    const entities = [];
    for (const [hazard, keywords] of Object.entries(hazardKeywords)) {
        entities.push(...findKeywordEntities(text, keywords, 'HAZARD', 0.7).map(entity => ({
            ...entity,
            value: hazard
        })));
    }

    entities.push(...findKeywordEntities(text, needKeywords, 'NEED', 0.5));
    entities.push(...findKeywordEntities(text, resourceKeywords, 'RESOURCE', 0.4));
    entities.push(...findKeywordEntities(text, victimKeywords, 'VICTIM', 0.6));

    const locationMatches = findKeywordEntities(text, locationIndicators, 'LOCATION', 0.3);
    entities.push(...locationMatches);

    return entities;
}

function detectHazards(text, entities) {
    const hazardScores = {};
    if (Array.isArray(entities)) {
        for (const entity of entities) {
            if (entity.type === 'HAZARD') {
                hazardScores[entity.value] = Math.max(hazardScores[entity.value] || 0, entity.confidence);
            }
        }
    }

    for (const [hazard, keywords] of Object.entries(hazardKeywords)) {
        for (const keyword of keywords) {
            if (text.includes(keyword)) {
                hazardScores[hazard] = Math.max(hazardScores[hazard] || 0, 0.6);
            }
        }
    }

    const results = Object.entries(hazardScores).map(([label, confidence]) => ({
        label,
        confidence: Math.min(1, confidence)
    }));

    if (results.length === 0) {
        results.push({ label: 'OTHER', confidence: 0.2 });
    }

    return results;
}

module.exports = {
    extractEntities,
    detectHazards
};
