import { describe, it, expect, beforeEach } from 'vitest';
import { getToken } from './auth-token';

describe('getToken', () => {
    beforeEach(() => {
        window.sessionStorage.clear();
    });

    it('returns the auth token when present in sessionStorage', () => {
        window.sessionStorage.setItem('auth_token', 'my-secret-token');
        expect(getToken()).toBe('my-secret-token');
    });

    it('returns an empty string when no token is stored', () => {
        expect(getToken()).toBe('');
    });
});
