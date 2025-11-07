const DEFAULT_WEIGHTS = Object.freeze({
    hazard: 0.35,
    urgency: 0.25,
    sensor: 0.35,
    geo: 0.05
});

function parseWeightConfig(configString) {
    if (!configString) {
        return { ...DEFAULT_WEIGHTS };
    }

    return configString.split(',').reduce((acc, pair) => {
        const [key, value] = pair.split(':').map(part => part.trim());
        if (key && !Number.isNaN(Number(value))) {
            acc[key] = Number(value);
        }
        return acc;
    }, { ...DEFAULT_WEIGHTS });
}

function clamp(value, min = 0, max = 1) {
    return Math.max(min, Math.min(max, value));
}

function severityFromConfidence(confidence, sensorEvidenceCount = 0) {
    if (sensorEvidenceCount >= 2 || confidence >= 0.8) {
        return 'CRITICAL';
    }
    if (confidence >= 0.55) {
        return 'WARNING';
    }
    return 'INFO';
}

module.exports = {
    DEFAULT_WEIGHTS,
    parseWeightConfig,
    clamp,
    severityFromConfidence
};
