const { parseWeightConfig, clamp, severityFromConfidence } = require('../../utils/scoring');

function computeScores({ hazards = [], urgency = { level: 'LOW', score: 0.1 }, sensorMatches = [], geoConfidence = 0.5 }) {
    const weights = parseWeightConfig(process.env.NLP_SENSOR_WEIGHTS);

    const hazardScore = Math.min(1, hazards.reduce((acc, hazard) => acc + hazard.confidence, 0));
    const urgencyScore = urgency.score || 0;
    const sensorScore = Math.min(1, sensorMatches.reduce((acc, sensor) => acc + (sensor.score || 0.3), 0));
    const geoScore = geoConfidence;

    const weighted = (hazardScore * weights.hazard) + (urgencyScore * weights.urgency) + (sensorScore * weights.sensor) + (geoScore * weights.geo);
    const confidence = clamp(weighted, 0, 1);
    const severity = severityFromConfidence(confidence, sensorMatches.length);

    return {
        confidence,
        severity,
        breakdown: {
            hazardScore,
            urgencyScore,
            sensorScore,
            geoScore,
            weights
        }
    };
}

function buildExplanation({ hazards = [], urgency = { level: 'LOW' }, geo, sensorMatches = [] }) {
    const hazardLabels = hazards.length ? hazards.map(h => h.label).join(', ') : 'General incident';
    const urgencyLabel = urgency.level || 'LOW';
    const locationPart = geo?.name || geo?.resolvedFrom || 'unspecified location';
    const sensorPart = sensorMatches.length
        ? sensorMatches.map(match => `${match.label} (${match.score.toFixed(2)})`).join('; ')
        : 'no sensor corroboration';

    return `Detected ${hazardLabels} with ${urgencyLabel} urgency at ${locationPart}; sensor evidence: ${sensorPart}.`;
}

module.exports = {
    computeScores,
    buildExplanation
};
