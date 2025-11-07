const HIGH_URGENCY_KEYWORDS = ['urgent', 'immediately', 'trapped', 'help us', 'emergency'];
const MEDIUM_URGENCY_KEYWORDS = ['need help', 'please help', 'stuck', 'danger'];

function classifyUrgency(text, entities = []) {
    if (!text) {
        return { level: 'LOW', score: 0.1 };
    }

    const lower = text.toLowerCase();
    let score = 0.1;

    for (const keyword of HIGH_URGENCY_KEYWORDS) {
        if (lower.includes(keyword)) {
            score = Math.max(score, 0.9);
        }
    }

    if (score < 0.9) {
        for (const keyword of MEDIUM_URGENCY_KEYWORDS) {
            if (lower.includes(keyword)) {
                score = Math.max(score, 0.6);
            }
        }
    }

    const exclamationMarks = (text.match(/!/g) || []).length;
    if (exclamationMarks >= 2) {
        score = Math.max(score, 0.7);
    }

    if (entities.some(entity => entity.type === 'VICTIM')) {
        score = Math.max(score, 0.75);
    }

    let level = 'LOW';
    if (score >= 0.8) {
        level = 'HIGH';
    } else if (score >= 0.5) {
        level = 'MEDIUM';
    }

    return { level, score: Number(score.toFixed(2)) };
}

module.exports = {
    classifyUrgency
};
