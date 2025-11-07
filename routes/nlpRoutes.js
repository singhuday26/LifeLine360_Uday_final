const express = require('express');
const mongoose = require('mongoose');
const Joi = require('joi');
const AlertCandidate = require('../models/AlertCandidate');
const logger = require('../middleware/logger');
const { protect, checkRole } = require('../middleware/auth');
const nlpStream = require('../sse/nlpStream');

const router = express.Router();

const querySchema = Joi.object({
    status: Joi.string().valid('PENDING', 'VERIFIED', 'REJECTED').default('PENDING'),
    sectorId: Joi.string().optional()
});

const verifySchema = Joi.object({
    candidateId: Joi.string().required(),
    decision: Joi.string().valid('VERIFY', 'REJECT').required(),
    note: Joi.string().allow('').optional()
});

router.use(protect, checkRole(['super_admin', 'fire_admin', 'flood_admin']));

router.get('/nlp/candidates', async (req, res) => {
    const { error, value } = querySchema.validate(req.query);
    if (error) {
        return res.status(400).json({ success: false, message: error.message });
    }

    try {
        const filter = { status: value.status };
        if (value.sectorId) {
            filter.sectorId = value.sectorId;
        }

        const candidates = await AlertCandidate.find(filter)
            .sort({ updatedAt: -1 })
            .limit(100)
            .lean();

        res.json({ success: true, data: candidates });
    } catch (err) {
        logger.error('Failed to list NLP candidates', { error: err.message });
        res.status(500).json({ success: false, message: 'Failed to fetch candidates' });
    }
});

router.post('/alerts/verify', async (req, res) => {
    const { error, value } = verifySchema.validate(req.body);
    if (error) {
        return res.status(400).json({ success: false, message: error.message });
    }

    try {
        const candidateId = new mongoose.Types.ObjectId(value.candidateId);
        const status = value.decision === 'VERIFY' ? 'VERIFIED' : 'REJECTED';

        const candidate = await AlertCandidate.findByIdAndUpdate(
            candidateId,
            {
                $set: {
                    status,
                    verifier: {
                        userId: req.user._id.toString(),
                        name: `${req.user.firstName || ''} ${req.user.lastName || ''}`.trim() || req.user.email,
                        at: new Date()
                    }
                }
            },
            { new: true }
        );

        if (!candidate) {
            return res.status(404).json({ success: false, message: 'Candidate not found' });
        }

        const payload = candidate.toObject();
        payload.note = value.note;
        nlpStream.broadcastDecision(payload);

        res.json({ success: true, data: payload });
    } catch (err) {
        logger.error('Failed to update candidate decision', { error: err.message });
        res.status(500).json({ success: false, message: 'Failed to update candidate' });
    }
});

module.exports = router;
