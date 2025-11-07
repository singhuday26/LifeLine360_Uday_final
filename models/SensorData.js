const mongoose = require('mongoose');

const sensorDataSchema = new mongoose.Schema({
    sensorId: { type: String, required: true },
    type: { type: String, required: true }, // e.g., 'temperature', 'rainfall', 'seismic', etc.
    value: { type: mongoose.Schema.Types.Mixed, required: true }, // Can be number, string, or object
    unit: { type: String }, // e.g., '°C', 'mm', 'm/s²'
    location: {
        lat: { type: Number },
        lng: { type: Number },
        address: { type: String }
    },
    timestamp: { type: Date, default: Date.now },
    topic: { type: String, required: true },
    rawData: { type: mongoose.Schema.Types.Mixed } // Store the original MQTT payload
});

module.exports = mongoose.models.SensorData || mongoose.model('SensorData', sensorDataSchema);
