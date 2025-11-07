const logger = require('../middleware/logger');

const clients = new Set();

function sendEvent(res, event) {
    res.write(`data: ${JSON.stringify(event)}\n\n`);
}

function registerStream(req, res) {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders?.();

    const client = { res };
    clients.add(client);

    req.on('close', () => {
        clients.delete(client);
        logger.info('SSE client disconnected', { totalClients: clients.size });
    });

    logger.info('SSE client connected', { totalClients: clients.size });
}

function broadcastCandidate(candidate) {
    const payload = { type: 'CANDIDATE', payload: candidate };
    clients.forEach(client => sendEvent(client.res, payload));
}

function broadcastDecision(decision) {
    const payload = { type: 'DECISION', payload: decision };
    clients.forEach(client => sendEvent(client.res, payload));
}

module.exports = {
    registerStream,
    broadcastCandidate,
    broadcastDecision
};
