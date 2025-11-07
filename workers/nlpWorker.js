const Communication = require('../models/Communication');
const nlpStream = require('../sse/nlpStream');
const { runNlpPipeline } = require('../services/nlp/pipeline');
const logger = require('../middleware/logger');

const queue = [];
let processing = false;

function enqueueCommunication(commId) {
    if (!commId) {
        return;
    }
    queue.push(commId);
    processQueue().catch(error => {
        logger.error('Failed to process NLP queue', { error: error.message });
    });
}

async function processQueue() {
    if (processing) {
        return;
    }
    processing = true;

    while (queue.length > 0) {
        const commId = queue.shift();
        try {
            const communication = await Communication.findById(commId);
            if (!communication) {
                logger.warn('Communication not found for NLP processing', { commId: commId.toString() });
                continue;
            }

            const { candidate } = await runNlpPipeline(communication);
            if (candidate) {
                nlpStream.broadcastCandidate(candidate.toObject ? candidate.toObject() : candidate);
            }
        } catch (error) {
            logger.error('Error processing communication through NLP', { commId, error: error.message });
        }
    }

    processing = false;
}

module.exports = {
    enqueueCommunication
};
