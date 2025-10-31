const Joi = require('joi');

// Sensor data validation schema
const sensorData = Joi.object({
    sensorId: Joi.string().required(),
    id: Joi.string().optional(),
    type: Joi.string().valid('temperature', 'rainfall', 'seismic', 'smoke', 'flood', 'air_quality').required(),
    value: Joi.alternatives().try(Joi.number(), Joi.string()).required(),
    unit: Joi.string().optional(),
    location: Joi.object({
        lat: Joi.number().min(-90).max(90).required(),
        lng: Joi.number().min(-180).max(180).required(),
        address: Joi.string().required()
    }).optional(),
    timestamp: Joi.date().optional(),
    topic: Joi.string().optional()
});

// Sensor data query validation schema
const sensorDataQuery = Joi.object({
    limit: Joi.number().integer().min(1).max(1000).optional(),
    type: Joi.string().optional(),
    sensorId: Joi.string().optional(),
    startDate: Joi.date().optional(),
    endDate: Joi.date().optional()
});

// Hotspot validation schema
const hotspot = Joi.object({
    type: Joi.string().valid('flood', 'fire', 'earthquake', 'storm', 'accident', 'medical', 'air_quality', 'other').required(),
    severity: Joi.string().valid('low', 'medium', 'high', 'critical').required(),
    location: Joi.object({
        lat: Joi.number().min(-90).max(90).required(),
        lng: Joi.number().min(-180).max(180).required(),
        address: Joi.string().min(5).max(200).required()
    }).required(),
    description: Joi.string().min(10).max(500).required(),
    sensors: Joi.array().items(Joi.string()).optional(),
    status: Joi.string().valid('active', 'monitoring', 'resolved').required()
});

// Hotspot query validation schema
const hotspotQuery = Joi.object({
    type: Joi.string().optional(),
    severity: Joi.string().optional(),
    status: Joi.string().optional(),
    city: Joi.string().optional(),
    startDate: Joi.date().optional(),
    endDate: Joi.date().optional(),
    sort: Joi.string().optional(),
    limit: Joi.number().integer().min(1).max(100).optional()
});

// Stats update validation schema
const statsUpdate = Joi.object({
    activeAlerts: Joi.number().integer().min(0).optional(),
    sensorsOnline: Joi.number().integer().min(0).optional(),
    communityReports: Joi.number().integer().min(0).optional()
});

// Incident report validation schema
const incidentReport = Joi.object({
    incidentType: Joi.string().valid('flood', 'fire', 'earthquake', 'storm', 'accident', 'medical', 'other').required(),
    severity: Joi.string().valid('low', 'medium', 'high', 'critical').required(),
    description: Joi.string().min(10).max(1000).required(),
    location: Joi.string().min(5).max(200).required(),
    contactName: Joi.string().min(2).max(100).optional(),
    contactPhone: Joi.string().optional(),
    contactEmail: Joi.string().email().optional(),
    status: Joi.string().valid('pending', 'investigating', 'resolved', 'false_alarm').optional()
});

module.exports = {
    sensorData,
    sensorDataQuery,
    hotspot,
    hotspotQuery,
    statsUpdate,
    incidentReport
};