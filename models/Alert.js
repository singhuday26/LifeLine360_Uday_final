const mongoose = require('mongoose');

const alertSchema = new mongoose.Schema({
    sensorId: { type: String, required: true },
    sensorType: { type: String, required: true },
    value: { type: mongoose.Schema.Types.Mixed, required: true },
    threshold: { type: Number, required: true },
    severity: { type: String, enum: ['low', 'medium', 'high', 'critical'], required: true },
    message: { type: String, required: true },
    location: {
        lat: { type: Number },
        lng: { type: Number },
        address: { type: String }
    },
    emailSent: { type: Boolean, default: false },
    emailRecipients: [{ type: String }],
    emailSentAt: { type: Date },
    acknowledged: { type: Boolean, default: false },
    acknowledgedAt: { type: Date },
    acknowledgedBy: { type: String },
    timestamp: { type: Date, default: Date.now },
    resolved: { type: Boolean, default: false },
    resolvedAt: { type: Date },
    status: { type: String, enum: ['pending', 'verified', 'resolved'], default: 'pending' },
    assignedToDept: { type: String, enum: ['fire', 'flood', 'general', 'none'], default: 'none' }
}, {
    timestamps: true
});

module.exports = mongoose.model('Alert', alertSchema);