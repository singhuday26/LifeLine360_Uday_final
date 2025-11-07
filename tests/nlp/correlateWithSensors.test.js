import { describe, it, expect, vi } from 'vitest';
const { correlateWithSensors } = require('../../services/nlp/correlateWithSensors.js');
const SensorData = require('../../models/SensorData.js');

vi.mock('../../models/SensorData.js');

describe('correlateWithSensors', () => {
    it('should return sensor score and nearby sensors', async () => {
        const mockSensors = [
            { lat: 12.9716, lon: 77.5946, timestamp: new Date(), payload: { anomaly: true } }
        ];
        const mockQuery = {
            limit: vi.fn().mockResolvedValue(mockSensors)
        };
        SensorData.find = vi.fn().mockReturnValue(mockQuery);

        const result = await correlateWithSensors({ lat: 12.9716, lon: 77.5946, timestamp: new Date() });
        expect(result).toHaveProperty('sensorScore');
        expect(result).toHaveProperty('nearbySensors');
        expect(result.nearbySensors).toEqual(mockSensors);
    });

    it('should handle no nearby sensors', async () => {
        const mockQuery = {
            limit: vi.fn().mockResolvedValue([])
        };
        SensorData.find = vi.fn().mockReturnValue(mockQuery);

        const result = await correlateWithSensors({ lat: 12.9716, lon: 77.5946, timestamp: new Date() });
        expect(result.sensorScore).toBe(0.1);
        expect(result.nearbySensors).toEqual([]);
    });
});