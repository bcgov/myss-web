import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

vi.mock('$env/static/public', () => ({
    PUBLIC_API_URL: '/api-proxy',
}));

import { apiGet, apiPost, apiPut, apiPatch, apiDelete } from './client';

describe('API client', () => {
    beforeEach(() => {
        mockFetch.mockReset();
    });

    describe('apiGet', () => {
        it('sends GET with Authorization header', async () => {
            mockFetch.mockResolvedValue({
                ok: true,
                status: 200,
                json: () => Promise.resolve({ id: 1 }),
            });
            const result = await apiGet<{ id: number }>('/items', 'tok');
            expect(mockFetch).toHaveBeenCalledWith('/api-proxy/items', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: 'Bearer tok',
                },
            });
            expect(result).toEqual({ id: 1 });
        });

        it('appends query params', async () => {
            mockFetch.mockResolvedValue({
                ok: true,
                status: 200,
                json: () => Promise.resolve([]),
            });
            await apiGet('/items', 'tok', { page: '1', size: '10' });
            const url = mockFetch.mock.calls[0][0];
            expect(url).toBe('/api-proxy/items?page=1&size=10');
        });

        it('throws on non-ok response', async () => {
            mockFetch.mockResolvedValue({
                ok: false,
                status: 404,
                json: () => Promise.resolve({ detail: 'Not found' }),
            });
            await expect(apiGet('/missing', 'tok')).rejects.toThrow('404');
        });
    });

    describe('apiPost', () => {
        it('sends POST with JSON body', async () => {
            mockFetch.mockResolvedValue({
                ok: true,
                status: 200,
                json: () => Promise.resolve({ id: 2 }),
            });
            const result = await apiPost<{ id: number }>('/items', 'tok', { name: 'test' });
            expect(mockFetch).toHaveBeenCalledWith('/api-proxy/items', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: 'Bearer tok',
                },
                body: '{"name":"test"}',
            });
            expect(result).toEqual({ id: 2 });
        });
    });

    describe('apiPut', () => {
        it('sends PUT with JSON body', async () => {
            mockFetch.mockResolvedValue({
                ok: true,
                status: 200,
                json: () => Promise.resolve({ updated: true }),
            });
            await apiPut('/items/1', 'tok', { name: 'updated' });
            expect(mockFetch.mock.calls[0][1].method).toBe('PUT');
        });
    });

    describe('apiPatch', () => {
        it('sends PATCH with JSON body', async () => {
            mockFetch.mockResolvedValue({
                ok: true,
                status: 200,
                json: () => Promise.resolve({ patched: true }),
            });
            await apiPatch('/items/1', 'tok', { field: 'val' });
            expect(mockFetch.mock.calls[0][1].method).toBe('PATCH');
        });

        it('returns undefined for 204 No Content', async () => {
            mockFetch.mockResolvedValue({
                ok: true,
                status: 204,
                json: () => Promise.reject(new Error('no body')),
            });
            const result = await apiPatch<void>('/items/1', 'tok', {});
            expect(result).toBeUndefined();
        });
    });

    describe('apiDelete', () => {
        it('sends DELETE', async () => {
            mockFetch.mockResolvedValue({
                ok: true,
                status: 204,
                json: () => Promise.reject(new Error('no body')),
            });
            await apiDelete('/items/1', 'tok');
            expect(mockFetch.mock.calls[0][1].method).toBe('DELETE');
        });
    });
});
