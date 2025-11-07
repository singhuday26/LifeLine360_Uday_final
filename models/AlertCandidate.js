const mongoose = require('mongoose');

const EvidenceSchema = new mongoose.Schema({
    type: {
        type: String,
        enum: ['SENSOR', 'COMM'],
        required: true
    },
    refId: {
        type: String,
        required: true
    },
    label: String,
    score: Number,
    timestamp: Date
}, { _id: false });

const VerifierSchema = new mongoose.Schema({
    userId: String,
    name: String,
    at: Date
}, { _id: false });

const AlertCandidateSchema = new mongoose.Schema({
    sectorId: {
        type: String,
        index: true
    },
    centroid: {
        lat: Number,
        lng: Number
    },
    hazard: {
        type: String,
        enum: ['FIRE', 'FLOOD', 'GAS_LEAK', 'HEATWAVE', 'LANDSLIDE', 'EARTHQUAKE', 'OTHER'],
        required: true
    },
    severity: {
        type: String,
        enum: ['INFO', 'WARNING', 'CRITICAL'],
        default: 'INFO'
    },
    confidence: {
        type: Number,
        default: 0
    },
    evidence: [EvidenceSchema],
    status: {
        type: String,
        enum: ['PENDING', 'VERIFIED', 'REJECTED'],
        default: 'PENDING',
        index: true
    },
    verifier: VerifierSchema,
    explanation: String
}, {
    timestamps: true
});

AlertCandidateSchema.index({ hazard: 1, status: 1 });
AlertCandidateSchema.index({ updatedAt: -1 });

module.exports = mongoose.models.AlertCandidate || mongoose.model('AlertCandidate', AlertCandidateSchema);
