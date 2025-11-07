import { describe, it, expect } from 'vitest';
const { detectLanguage } = require('../../services/nlp/languageDetect.js');

describe('detectLanguage', () => {
    it('should detect English', () => {
        const result = detectLanguage('Hello world, this is a test message.');
        expect(result).toBe('eng');
    });

    it('should detect Hindi', () => {
        const result = detectLanguage('नमस्ते दुनिया, यह एक परीक्षण संदेश है।');
        expect(result).toBe('mag');
    });

    it('should return unknown for empty text', () => {
        const result = detectLanguage('');
        expect(result).toBe('unknown');
    });

    it('should return unknown for undefined', () => {
        const result = detectLanguage(undefined);
        expect(result).toBe('unknown');
    });
});