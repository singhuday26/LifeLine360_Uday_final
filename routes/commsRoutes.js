const express = require('express');
const rateLimit = require('express-rate-limit');
const jwt = require('jsonwebtoken');
const Joi = require('joi');
const Communication = require('../models/Communication');
const logger = require('../middleware/logger');
const { enqueueCommunication } = require('../workers/nlpWorker');

const router = express.Router();

const ingestSchema = Joi.object({
    source: Joi.string().valid('twitter', 'whatsapp', 'form', 'sms', 'other').default('other'),
    text: Joi.string().min(5).max(1000).required(),
    rawLat: Joi.number().optional(),
    rawLng: Joi.number().optional(),
    userHandle: Joi.string().optional(),
    externalId: Joi.string().optional()
});

const ingestLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 30,
    standardHeaders: true,
    legacyHeaders: false
});

function decodeUser(req) {
    const authHeader = req.header('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return null;
    }
    try {
        const token = authHeader.replace('Bearer ', '');
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
        return decoded;
    } catch (error) {
        logger.warn('Optional auth decode failed', { error: error.message });
        return null;
    }
}

router.post('/ingest', ingestLimiter, async (req, res) => {
    const { error, value } = ingestSchema.validate(req.body, { abortEarly: false });
    if (error) {
        return res.status(400).json({
            success: false,
            message: 'Invalid payload',
            details: error.details.map(detail => detail.message)
        });
    }

    try {
        const user = decodeUser(req);
        const communication = await Communication.create({
            ...value,
            receivedAt: new Date(),
            userHandle: value.userHandle || user?.email
        });

        enqueueCommunication(communication._id);

        res.status(201).json({
            success: true,
            message: 'Communication queued for processing',
            data: {
                id: communication._id,
                processed: communication.processed
            }
        });
    } catch (err) {
        logger.error('Failed to ingest communication', { error: err.message });
        res.status(500).json({
            success: false,
            message: 'Failed to ingest communication'
        });
    }
});

module.exports = router;
