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
    // Enhanced sensor data validation with more types
    sensorData: Joi.object({
        sensorId: Joi.string().required(),
        type: Joi.string().valid('temperature', 'humidity', 'gasValue', 'smoke', 'pm25', 'pm10', 'waterLevel', 'rainLevel', 'isFlame', 'shake', 'rainfall', 'seismic', 'flood', 'air_quality').required(),
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
        timestamp: Joi.date().optional(),
        topic: Joi.string().optional()
    }),

    // Push notification validation
    pushNotification: Joi.object({
        title: Joi.string().min(1).max(100).required(),
        body: Joi.string().min(1).max(250).required(),
        data: Joi.object().optional(),
        priority: Joi.string().valid('default', 'normal', 'high').default('high'),
        ttl: Joi.number().integer().min(0).max(86400).default(3600) // Max 24 hours
    }),

    // Email alert validation
    emailAlert: Joi.object({
        subject: Joi.string().min(1).max(200).required(),
        html: Joi.string().min(1).max(10000).required(),
        recipients: Joi.array().items(Joi.string().email()).min(1).required(),
        priority: Joi.string().valid('low', 'normal', 'high').default('high')
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

    // Sensor data query validation
    sensorDataQuery: Joi.object({
        limit: Joi.number().integer().min(1).max(1000).optional(),
        type: Joi.string().optional(),
        sensorId: Joi.string().optional(),
        startDate: Joi.date().iso().optional(),
        endDate: Joi.date().iso().when('startDate', {
            is: Joi.exist(),
            then: Joi.date().iso().min(Joi.ref('startDate'))
        }).optional()
    }),

    // Incident report validation
    incidentReport: Joi.object({
        incidentType: Joi.string().valid('flood', 'fire', 'earthquake', 'storm', 'accident', 'medical', 'other').required(),
        severity: Joi.string().valid('low', 'medium', 'high', 'critical').required(),
        description: Joi.string().min(10).max(1000).required(),
        location: Joi.string().min(5).max(200).required(),
        contactName: Joi.string().min(2).max(100).optional(),
        contactPhone: Joi.string().pattern(/^\+?[\d\s\-\(\)]+$/).optional(),
        contactEmail: Joi.string().email().optional()
    }).or('contactName', 'contactPhone', 'contactEmail'), // At least one contact method required

    // Auth validation schemas
    register: Joi.object({
        email: Joi.string().email().required(),
        password: Joi.string().min(6).required(),
        firstName: Joi.string().required(),
        lastName: Joi.string().required(),
        role: Joi.string().valid('public', 'fire_admin', 'flood_admin', 'super_admin').default('public')
    }),

    login: Joi.object({
        email: Joi.string().email().required(),
        password: Joi.string().required()
    })
};

module.exports = {
    validate,
    schemas
};