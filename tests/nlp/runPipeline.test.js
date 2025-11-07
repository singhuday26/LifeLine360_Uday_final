import { describe, it, expect, vi } from 'vitest';

vi.mock('../../services/nlp/correlateWithSensors.js', () => ({
    correlateWithSensors: vi.fn().mockResolvedValue({ sensorScore: 0.5, nearbySensors: [] })
}));

const { runNlpPipeline } = require('../../services/nlp/runPipeline.js');

describe('runNlpPipeline', () => {
    it('should handle communication without location', async () => {
        const mockComm = {
            text: 'Help needed',
            createdAt: new Date()
        };

        const result = await runNlpPipeline(mockComm);
        expect(result).toHaveProperty('sensorResult');
    });
});