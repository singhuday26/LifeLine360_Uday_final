import { describe, it, expect } from 'vitest';
const { getMessageHash } = require('../../services/nlp/dedupeCluster.js');

describe('getMessageHash', () => {
    it('should generate consistent hash for same text', () => {
        const hash1 = getMessageHash('Fire in the building');
        const hash2 = getMessageHash('Fire in the building');
        expect(hash1).toBe(hash2);
    });

    it('should generate different hash for different text', () => {
        const hash1 = getMessageHash('Fire in the building');
        const hash2 = getMessageHash('Flood in the area');
        expect(hash1).not.toBe(hash2);
    });

    it('should handle empty text', () => {
        const hash = getMessageHash('');
        expect(hash).toBeNull();
    });

    it('should handle short text', () => {
        const hash = getMessageHash('Hi');
        expect(hash).toBeDefined();
    });
});