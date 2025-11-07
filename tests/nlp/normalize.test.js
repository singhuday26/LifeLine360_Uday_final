import { describe, it, expect } from 'vitest';
const { normalize } = require('../../services/nlp/normalize.js');

describe('normalize', () => {
    it('should lowercase text', () => {
        const result = normalize('HELLO WORLD');
        expect(result).toBe('hello world');
    });

    it('should remove URLs', () => {
        const result = normalize('Check this http://example.com');
        expect(result).not.toContain('http://example.com');
    });

    it('should remove handles', () => {
        const result = normalize('@user said something');
        expect(result).not.toContain('@user');
    });

    it('should remove hashtags', () => {
        const result = normalize('#fire alert');
        expect(result).not.toContain('#fire');
    });

    it('should collapse spaces', () => {
        const result = normalize('too   many    spaces');
        expect(result).toBe('too many spaces');
    });

    it('should trim whitespace', () => {
        const result = normalize('  text  ');
        expect(result).toBe('text');
    });
});