function classifyUrgency(entities) {
    let score = 0;

    if (entities.hazards.length) score += 0.4;
    if (entities.needs.length) score += 0.3;
    if (entities.victims) score += 0.3;

    return Math.min(score, 1.0);
}

module.exports = {
    classifyUrgency
};
