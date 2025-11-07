const mongoose = require('mongoose');
const logger = require('../../middleware/logger');
const AlertCandidate = require('../../models/AlertCandidate');
const { sectorCentroid } = require('../../utils/sectorIndex');
const { computeScores, buildExplanation } = require('./ruleEngine');

const DEFAULT_DISTANCE_KM = Number(process.env.NLP_MAX_DISTANCE_KM) || 1.5;
const DEFAULT_TIME_WINDOW_MIN = Number(process.env.NLP_TIME_WINDOW_MIN) || 20;

function getSensorModel() {
    try {
        return mongoose.model('SensorData');
    } catch (error) {
        logger.error('SensorData model not registered');
        throw error;
    }
}

function toRadians(value) {
    return (value * Math.PI) / 180;
}

function haversineDistance(lat1, lng1, lat2, lng2) {
    if ([lat1, lng1, lat2, lng2].some(coord => typeof coord !== 'number')) {
        return Number.POSITIVE_INFINITY;
    }

    const R = 6371;
    const dLat = toRadians(lat2 - lat1);
    const dLng = toRadians(lng2 - lng1);
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2)
        + Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2))
        * Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

function sensorMatchesHazard(sensor) {
    if (!sensor || !sensor.type) {
        return null;
    }

    const type = sensor.type.toLowerCase();
    const value = Number(sensor.value || sensor.reading);

    if (type.includes('pm') && value >= 150) {
        return { hazard: 'FIRE', label: 'PM2.5 spike', score: 0.35 };
    }
    if (type.includes('mq') && value >= 200) {
        return { hazard: 'FIRE', label: 'Smoke/Gas spike', score: 0.35 };
    }
    if (type.includes('temperature') && value >= 40) {
        return { hazard: 'HEATWAVE', label: 'High temperature', score: 0.3 };
    }
    if (type.includes('humidity') && value <= 20) {
        return { hazard: 'HEATWAVE', label: 'Low humidity', score: 0.2 };
    }
    if (type.includes('water') && value && value < 0.5) {
        return { hazard: 'FLOOD', label: 'Water level rise', score: 0.35 };
    }

    return null;
}

async function correlateWithSensorsAndUpsertCandidate({
    sectorId,
    geo,
    hazards,
    urgency,
    extractionId,
    commId
}) {
    const SensorData = getSensorModel();
    const centroid = geo?.lat && geo?.lng ? { lat: geo.lat, lng: geo.lng } : sectorCentroid(sectorId);
    const geoConfidence = geo?.confidence || 0.4;

    const endTime = new Date();
    const startTime = new Date(endTime.getTime() - DEFAULT_TIME_WINDOW_MIN * 60 * 1000);

    let sensorMatches = [];

    try {
        const sensors = await SensorData.find({
            timestamp: { $gte: startTime, $lte: endTime }
        }).limit(200);

        sensorMatches = sensors
            .map(sensor => {
                const match = sensorMatchesHazard(sensor);
                if (!match) {
                    return null;
                }

                const distance = centroid && sensor.location
                    ? haversineDistance(
                        centroid.lat,
                        centroid.lng,
                        sensor.location.lat,
                        sensor.location.lng
                    )
                    : Number.POSITIVE_INFINITY;

                if (distance <= DEFAULT_DISTANCE_KM) {
                    return {
                        ...match,
                        refId: sensor._id.toString(),
                        timestamp: sensor.timestamp,
                        distanceKm: Number(distance.toFixed(2))
                    };
                }
                return null;
            })
            .filter(Boolean);
    } catch (error) {
        logger.error('Failed to correlate sensors', { error: error.message });
    }

    const scoring = computeScores({ hazards, urgency, sensorMatches, geoConfidence });
    const explanation = buildExplanation({ hazards, urgency, geo, sensorMatches });

    if (!sectorId && !centroid) {
        logger.warn('Skipping candidate creation due to missing sector/centroid');
        return null;
    }

    const hazardLabel = hazards?.[0]?.label || 'OTHER';

    const evidence = [
        {
            type: 'COMM',
            refId: commId.toString(),
            label: 'Community report',
            score: urgency.score,
            timestamp: new Date()
        },
        ...sensorMatches.map(match => ({
            type: 'SENSOR',
            refId: match.refId,
            label: match.label,
            score: match.score,
            timestamp: match.timestamp
        }))
    ];

    try {
        const update = {
            sectorId,
            centroid,
            hazard: hazardLabel,
            severity: scoring.severity,
            confidence: Number(scoring.confidence.toFixed(2)),
            explanation,
            status: 'PENDING'
        };

        const candidate = await AlertCandidate.findOneAndUpdate(
            { sectorId, hazard: hazardLabel, status: 'PENDING' },
            { $set: update, $addToSet: { evidence: { $each: evidence } } },
            { new: true, upsert: true, setDefaultsOnInsert: true }
        );

        return candidate;
    } catch (error) {
        logger.error('Failed to upsert alert candidate', { error: error.message });
        return null;
    }
}

module.exports = {
    correlateWithSensorsAndUpsertCandidate
};
