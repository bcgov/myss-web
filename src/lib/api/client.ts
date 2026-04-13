// src/lib/api/client.ts
import { PUBLIC_API_URL } from '$env/static/public';

export const API_BASE_URL = PUBLIC_API_URL || 'http://localhost:8000';

export class ApiError extends Error {
    constructor(
        public status: number,
        public detail: unknown,
    ) {
        super(`Request failed (${status}): ${JSON.stringify(detail)}`);
        this.name = 'ApiError';
    }
}

function buildHeaders(token: string, extra?: Record<string, string>): Record<string, string> {
    return {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
        ...extra,
    };
}

async function handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
        const detail = await response.json().catch(() => ({ detail: 'Unknown error' }));
        throw new ApiError(response.status, detail);
    }
    if (response.status === 204) {
        return undefined as T;
    }
    return response.json() as Promise<T>;
}

export async function apiGet<T>(
    path: string,
    token: string,
    params?: Record<string, string>,
): Promise<T> {
    let url = `${API_BASE_URL}${path}`;
    if (params) {
        const qs = new URLSearchParams(params).toString();
        if (qs) url += `?${qs}`;
    }
    const response = await fetch(url, {
        method: 'GET',
        headers: buildHeaders(token),
    });
    return handleResponse<T>(response);
}

export async function apiPost<T>(
    path: string,
    token: string,
    body: unknown,
): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${path}`, {
        method: 'POST',
        headers: buildHeaders(token),
        body: JSON.stringify(body),
    });
    return handleResponse<T>(response);
}

export async function apiPut<T>(
    path: string,
    token: string,
    body: unknown,
): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${path}`, {
        method: 'PUT',
        headers: buildHeaders(token),
        body: JSON.stringify(body),
    });
    return handleResponse<T>(response);
}

export async function apiPatch<T>(
    path: string,
    token: string,
    body: unknown,
): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${path}`, {
        method: 'PATCH',
        headers: buildHeaders(token),
        body: JSON.stringify(body),
    });
    return handleResponse<T>(response);
}

export async function apiDelete<T>(
    path: string,
    token: string,
): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${path}`, {
        method: 'DELETE',
        headers: buildHeaders(token),
    });
    return handleResponse<T>(response);
}
