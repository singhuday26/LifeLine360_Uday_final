const mongoose = require('mongoose');

const statsSchema = new mongoose.Schema({
    totalAlerts: {
        type: Number,
        default: 0
    },
    activeAlerts: {
        type: Number,
        default: 0
    },
    activeHotspots: {
        type: Number,
        default: 0
    },
    onlineSensors: {
        type: Number,
        default: 0
    },
    totalIncidents: {
        type: Number,
        default: 0
    },
    lastUpdated: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Static method to get or create stats
statsSchema.statics.getStats = async function() {
    let stats = await this.findOne();
    if (!stats) {
        stats = await this.create({
            totalAlerts: 0,
            activeAlerts: 0,
            activeHotspots: 0,
            onlineSensors: 0,
            totalIncidents: 0
        });
    }
    return stats;
};

module.exports = mongoose.model('Stats', statsSchema);