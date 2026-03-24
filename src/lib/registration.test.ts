// src/lib/registration.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { startRegistration, savePersonalInfo, savePin } from '$lib/api/registration';

const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

beforeEach(() => mockFetch.mockReset());

describe('startRegistration', () => {
    it('returns a token on 201', async () => {
        mockFetch.mockResolvedValueOnce({
            ok: true,
            json: async () => ({ token: 'abc-123' }),
        });
        const result = await startRegistration('SELF');
        expect(result.token).toBe('abc-123');
    });

    it('throws on non-201', async () => {
        mockFetch.mockResolvedValueOnce({
            ok: false,
            status: 422,
            json: async () => ({ detail: 'invalid' }),
        });
        await expect(startRegistration('SELF')).rejects.toThrow();
    });
});

describe('savePersonalInfo', () => {
    it('calls POST /registration/{token}/personal-info', async () => {
        mockFetch.mockResolvedValueOnce({
            ok: true,
            json: async () => ({ next_step: 3 }),
        });
        const result = await savePersonalInfo('tok', {
            first_name: 'Mary',
            last_name: 'Smith',
            email: 'mary@example.com',
            email_confirm: 'mary@example.com',
            sin: '046454286',
            date_of_birth: '1990-05-15',
            gender: 'F',
            phone_number: '2505551234',
            phone_type: 'CELL',
            has_open_case: false,
        });
        expect(result.next_step).toBe(3);
        expect(mockFetch).toHaveBeenCalledWith(
            expect.stringContaining('/registration/tok/personal-info'),
            expect.objectContaining({ method: 'POST' }),
        );
    });
});

describe('savePin', () => {
    it('calls POST /registration/{token}/pin', async () => {
        mockFetch.mockResolvedValueOnce({
            ok: true,
            json: async () => ({ next_step: 5 }),
        });
        const result = await savePin('tok', '1234', '1234');
        expect(result.next_step).toBe(5);
    });
});
