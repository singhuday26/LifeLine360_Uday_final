const { classifyUrgency: baseClassifyUrgency } = require('../../services/nlp/urgencyClassify');

function classifyUrgency(entities = {}, options = {}) {
    let score = baseClassifyUrgency(entities) || 0;

    if (typeof options.minimumScore === 'number') {
        score = Math.max(score, options.minimumScore);
    }

    return Math.min(Number(score.toFixed(2)), 1);
}

module.exports = {
    classifyUrgency
};
