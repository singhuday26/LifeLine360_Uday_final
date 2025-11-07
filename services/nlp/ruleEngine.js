function applyRules({ entities, urgency, sensorResult }) {
    const hazardScore = entities.hazards.length ? 0.6 : 0.2;

    const final = (
        hazardScore * 0.35 +
        urgency * 0.25 +
        sensorResult.sensorScore * 0.35 +
        0.05
    );

    return {
        finalScore: final,
        severity:
            final > 0.75 ? 'CRITICAL' :
            final > 0.45 ? 'WARNING' :
                'INFO'
    };
}

module.exports = {
    applyRules
};
