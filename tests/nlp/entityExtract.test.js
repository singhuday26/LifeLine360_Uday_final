import { describe, it, expect } from 'vitest';
const { extractEntities } = require('../../services/nlp/entityExtract.js');

describe('extractEntities', () => {
    it('should detect hazards', () => {
        const result = extractEntities('There is a fire near the bridge.');
        expect(result.hazards).toContain('fire');
    });

    it('should detect needs', () => {
        const result = extractEntities('We need help urgently.');
        expect(result.needs).toContain('help');
    });

    it('should detect victims', () => {
        const result = extractEntities('5 people are trapped in the building.');
        expect(result.victims).toBe(true);
    });

    it('should handle multiple entities', () => {
        const result = extractEntities('Fire help needed, 3 people trapped.');
        expect(result.hazards).toContain('fire');
        expect(result.needs).toContain('help');
        expect(result.victims).toBe(true);
    });

    it('should return empty for no matches', () => {
        const result = extractEntities('This is a normal message.');
        expect(result.hazards).toEqual([]);
        expect(result.needs).toEqual([]);
        expect(result.victims).toBe(false);
    });
});