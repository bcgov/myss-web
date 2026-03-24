import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock fetch globally
const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

describe('api wrapper', () => {
    beforeEach(() => {
        mockFetch.mockReset();
    });

    it('apiGet attaches Authorization header', async () => {
        mockFetch.mockResolvedValueOnce({
            ok: true,
            json: async () => ({ data: 'test' }),
        });

        const { apiGet } = await import('./api');
        await apiGet('/test', 'test-jwt-token');

        expect(mockFetch).toHaveBeenCalledOnce();
        const [_url, opts] = mockFetch.mock.calls[0];
        expect((opts as RequestInit).headers).toMatchObject({
            Authorization: 'Bearer test-jwt-token',
        });
    });

    it('apiPost sets Content-Type application/json', async () => {
        mockFetch.mockResolvedValueOnce({
            ok: true,
            json: async () => ({ id: '123' }),
        });

        const { apiPost } = await import('./api');
        await apiPost('/test', { name: 'value' }, 'test-jwt-token');

        const [_url, opts] = mockFetch.mock.calls[0];
        expect((opts as RequestInit).headers).toMatchObject({
            'Content-Type': 'application/json',
            Authorization: 'Bearer test-jwt-token',
        });
    });
});
