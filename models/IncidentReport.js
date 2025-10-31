const mongoose = require('mongoose');

const incidentReportSchema = new mongoose.Schema({
    incidentType: { type: String, enum: ['flood', 'fire', 'earthquake', 'storm', 'accident', 'medical', 'other'], required: true },
    severity: { type: String, enum: ['low', 'medium', 'high', 'critical'], required: true },
    description: { type: String, required: true, minlength: 10, maxlength: 1000 },
    location: { type: String, required: true, minlength: 5, maxlength: 200 },
    contactName: { type: String, minlength: 2, maxlength: 100 },
    contactPhone: { type: String },
    contactEmail: { type: String },
    status: { type: String, enum: ['pending', 'verified', 'in_progress', 'resolved'], default: 'pending' },
    assignedToDept: { type: String, enum: ['fire', 'flood', 'general', 'none'], default: 'none' },
    adminNotes: { type: String },
    assignedTo: { type: String },
    notes: [{ type: String, timestamp: { type: Date, default: Date.now } }],
    timestamp: { type: Date, default: Date.now },
    resolvedAt: { type: Date },
    ipAddress: { type: String },
    userAgent: { type: String }
}, {
    timestamps: true
});

module.exports = mongoose.model('IncidentReport', incidentReportSchema);