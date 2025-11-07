const mongoose = require('mongoose');

const CommunicationSchema = new mongoose.Schema({
    source: {
        type: String,
        enum: ['twitter', 'whatsapp', 'form', 'sms', 'other'],
        default: 'other'
    },
    text: {
        type: String,
        required: true
    },
    textHash: {
        type: String
    },
    lang: {
        type: String,
        default: 'und'
    },
    receivedAt: {
        type: Date,
        default: Date.now
    },
    userHandle: {
        type: String
    },
    externalId: {
        type: String
    },
    rawLat: {
        type: Number
    },
    rawLng: {
        type: Number
    },
    processed: {
        type: Boolean,
        default: false
    },
    piiRedactedText: {
        type: String
    },
    sectorId: {
        type: String
    }
}, {
    timestamps: true
});

CommunicationSchema.index({ receivedAt: -1 });
CommunicationSchema.index({ sectorId: 1, processed: 1 });

module.exports = mongoose.models.Communication || mongoose.model('Communication', CommunicationSchema);
