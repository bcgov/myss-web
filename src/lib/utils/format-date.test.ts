import { describe, it, expect } from 'vitest';
import { formatDate } from './format-date';

describe('formatDate', () => {
    it('formats a valid ISO date to en-CA short format', () => {
        const result = formatDate('2025-03-15T10:00:00Z');
        expect(result).toBe('Mar 15, 2025');
    });

    it('returns the original string for invalid dates', () => {
        const result = formatDate('not-a-date');
        expect(result).toBe('not-a-date');
    });

    it('handles empty string gracefully', () => {
        const result = formatDate('');
        expect(result).toBe('');
    });
});
