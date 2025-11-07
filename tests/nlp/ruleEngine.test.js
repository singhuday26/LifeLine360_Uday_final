import { describe, it, expect } from 'vitest';
const { applyRules } = require('../../services/nlp/ruleEngine.js');

describe('applyRules', () => {
    it('should compute score and severity', () => {
        const result = applyRules({ entities: { hazards: ['fire'] }, urgency: 0.5, sensorResult: { sensorScore: 0.4 } });
        expect(result).toHaveProperty('finalScore');
        expect(result).toHaveProperty('severity');
        expect(result.finalScore).toBeGreaterThan(0);
    });

    it('should classify as CRITICAL for high score', () => {
        const result = applyRules({ entities: { hazards: ['fire'] }, urgency: 1, sensorResult: { sensorScore: 1 } });
        expect(result.severity).toBe('CRITICAL');
    });

    it('should classify as WARNING for medium score', () => {
        const result = applyRules({ entities: { hazards: ['fire'] }, urgency: 0.5, sensorResult: { sensorScore: 0.5 } });
        expect(result.severity).toBe('WARNING');
    });

    it('should classify as INFO for low score', () => {
        const result = applyRules({ entities: { hazards: [] }, urgency: 0, sensorResult: { sensorScore: 0 } });
        expect(result.severity).toBe('INFO');
    });
});