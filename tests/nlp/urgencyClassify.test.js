import { describe, it, expect } from 'vitest';
const { classifyUrgency } = require('../../services/nlp/urgencyClassify.js');

describe('classifyUrgency', () => {
    it('should score high for hazards', () => {
        const entities = { hazards: ['fire'], needs: [], victims: false };
        const result = classifyUrgency(entities);
        expect(result).toBeGreaterThan(0.3);
    });

    it('should score for needs', () => {
        const entities = { hazards: [], needs: ['help'], victims: false };
        const result = classifyUrgency(entities);
        expect(result).toBeGreaterThan(0.2);
    });

    it('should score for victims', () => {
        const entities = { hazards: [], needs: [], victims: true };
        const result = classifyUrgency(entities);
        expect(result).toBeGreaterThan(0.2);
    });

    it('should cap at 1.0', () => {
        const entities = { hazards: ['fire', 'flood'], needs: ['help', 'water'], victims: true };
        const result = classifyUrgency(entities);
        expect(result).toBeLessThanOrEqual(1.0);
    });

    it('should score 0 for no entities', () => {
        const entities = { hazards: [], needs: [], victims: false };
        const result = classifyUrgency(entities);
        expect(result).toBe(0);
    });
});