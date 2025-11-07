const mongoose = require('mongoose');

const EntitySchema = new mongoose.Schema({
    type: {
        type: String,
        enum: ['HAZARD', 'LOCATION', 'NEED', 'RESOURCE', 'VICTIM', 'ORG', 'MISC'],
        required: true
    },
    value: {
        type: String,
        required: true
    },
    start: Number,
    end: Number,
    confidence: Number
}, { _id: false });

const HazardSchema = new mongoose.Schema({
    label: {
        type: String,
        enum: ['FIRE', 'FLOOD', 'GAS_LEAK', 'HEATWAVE', 'LANDSLIDE', 'EARTHQUAKE', 'OTHER'],
        required: true
    },
    confidence: Number
}, { _id: false });

const UrgencySchema = new mongoose.Schema({
    level: {
        type: String,
        enum: ['LOW', 'MEDIUM', 'HIGH'],
        default: 'LOW'
    },
    score: {
        type: Number,
        default: 0
    }
}, { _id: false });

const GeoSchema = new mongoose.Schema({
    lat: Number,
    lng: Number,
    resolvedFrom: String
}, { _id: false });

const NlpExtractionSchema = new mongoose.Schema({
    commId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Communication',
        required: true,
        index: true
    },
    tokens: [String],
    entities: [EntitySchema],
    hazards: [HazardSchema],
    urgency: UrgencySchema,
    geo: GeoSchema,
    sectorId: {
        type: String,
        index: true
    },
    dedupeGroupId: String,
    explanation: String
}, {
    timestamps: true
});

module.exports = mongoose.models.NlpExtraction || mongoose.model('NlpExtraction', NlpExtractionSchema);
