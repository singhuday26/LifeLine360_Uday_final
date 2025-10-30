const Joi = require('joi');

// Validation middleware factory
const validate = (schema) => {
    return (req, res, next) => {
        const { error } = schema.validate(req.body, { abortEarly: false });

        if (error) {
            const errors = error.details.map(detail => ({
                field: detail.path.join('.'),
                message: detail.message
            }));

            return res.status(400).json({
                success: false,
                error: {
                    message: 'Validation failed',
                    details: errors
                }
            });
        }

        next();
    };
};

// Validation schemas
const schemas = {
    // Sensor data validation
    sensorData: Joi.object({
        sensorId: Joi.string().required(),
        type: Joi.string().valid('temperature', 'humidity', 'gasValue', 'smoke', 'pm25', 'pm10', 'waterLevel', 'rainLevel', 'isFlame', 'shake').required(),
        value: Joi.alternatives().try(
            Joi.number(),
            Joi.string(),
            Joi.object()
        ).required(),
        unit: Joi.string().optional(),
        location: Joi.object({
            lat: Joi.number().min(-90).max(90).required(),
            lng: Joi.number().min(-180).max(180).required(),
            address: Joi.string().optional()
        }).optional(),
        timestamp: Joi.date().optional()
    }),

    // Hotspot validation
    hotspot: Joi.object({
        type: Joi.string().valid('fire', 'flood', 'earthquake', 'air_quality').required(),
        severity: Joi.string().valid('low', 'medium', 'high', 'critical').required(),
        location: Joi.object({
            lat: Joi.number().min(-90).max(90).required(),
            lng: Joi.number().min(-180).max(180).required(),
            address: Joi.string().required()
        }).required(),
        description: Joi.string().min(10).max(500).required(),
        sensors: Joi.array().items(Joi.string()).optional(),
        status: Joi.string().valid('active', 'monitoring', 'resolved').required()
    }),

    // Stats update validation
    statsUpdate: Joi.object({
        activeAlerts: Joi.number().integer().min(0).optional(),
        sensorsOnline: Joi.number().integer().min(0).optional(),
        communityReports: Joi.number().integer().min(0).optional()
    }).min(1), // At least one field must be provided

    // Query parameters validation
    hotspotQuery: Joi.object({
        type: Joi.string().optional(),
        severity: Joi.string().optional(),
        status: Joi.string().optional(),
        city: Joi.string().optional(),
        startDate: Joi.date().iso().optional(),
        endDate: Joi.date().iso().when('startDate', {
            is: Joi.exist(),
            then: Joi.date().iso().min(Joi.ref('startDate'))
        }).optional(),
        sort: Joi.string().optional(),
        limit: Joi.number().integer().min(1).max(100).optional()
    }),

    sensorDataQuery: Joi.object({
        limit: Joi.number().integer().min(1).max(100).optional(),
        sensorId: Joi.string().optional(),
        type: Joi.string().optional(),
        startDate: Joi.date().iso().optional(),
        endDate: Joi.date().iso().when('startDate', {
            is: Joi.exist(),
            then: Joi.date().iso().min(Joi.ref('startDate'))
        }).optional()
    })
};

module.exports = {
    validate,
    schemas
};