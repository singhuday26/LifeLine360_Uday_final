const SensorData = require('../../models/SensorData');

async function correlateWithSensors({ lat, lon, timestamp }) {
    if (!lat || !lon) return { sensorScore: 0, nearbySensors: [] };

    const windowMs = Number(process.env.NLP_TIME_WINDOW_MIN || 20) * 60000;

    const sensors = await SensorData.find({
        ts: {
            $gte: new Date(timestamp - windowMs),
            $lte: new Date(timestamp + windowMs)
        }
    }).limit(20);

    return {
        sensorScore: sensors.length ? 0.7 : 0.1,
        nearbySensors: sensors
    };
}

module.exports = {
    correlateWithSensors
};
