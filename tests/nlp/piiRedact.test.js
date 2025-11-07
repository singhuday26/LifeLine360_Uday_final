import { describe, it, expect } from 'vitest';
const { redactPII } = require('../../services/nlp/piiRedact.js');

describe('redactPII', () => {
    it('should redact email addresses', () => {
        const result = redactPII('Contact me at john@example.com for help.');
        expect(result).toBe('Contact me at ***@*** for help.');
    });

    it('should redact phone numbers', () => {
        const result = redactPII('Call 1234567890 immediately.');
        expect(result).toBe('Call ********** immediately.');
    });

    it('should redact Aadhaar-like numbers', () => {
        const result = redactPII('My ID is 1234 5678 9012.');
        expect(result).toBe('My ID is *** *** ***.');
    });

    it('should handle multiple PII', () => {
        const result = redactPII('Email: test@example.com, Phone: 9876543210, ID: 1111 2222 3333');
        expect(result).toBe('Email: ***@*** Phone: **********, ID: *** *** ***');
    });

    it('should return original text if no PII', () => {
        const result = redactPII('This is a normal message.');
        expect(result).toBe('This is a normal message.');
    });

    it('should handle empty input', () => {
        const result = redactPII('');
        expect(result).toBe('');
    });
});