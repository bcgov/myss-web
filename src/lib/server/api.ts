const API_BASE_URL = process.env.API_BASE_URL ?? 'http://localhost:8000';

function buildHeaders(token?: string, extra?: Record<string, string>): Record<string, string> {
    const headers: Record<string, string> = { ...extra };
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
}

async function handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
        const body = await response.text();
        throw new Error(`API error ${response.status}: ${body}`);
    }
    return response.json() as Promise<T>;
}

export async function apiGet<T>(path: string, token?: string): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${path}`, {
        method: 'GET',
        headers: buildHeaders(token),
    });
    return handleResponse<T>(response);
}

export async function apiPost<T>(path: string, body: unknown, token?: string): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${path}`, {
        method: 'POST',
        headers: buildHeaders(token, { 'Content-Type': 'application/json' }),
        body: JSON.stringify(body),
    });
    return handleResponse<T>(response);
}

export async function apiPut<T>(path: string, body: unknown, token?: string): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${path}`, {
        method: 'PUT',
        headers: buildHeaders(token, { 'Content-Type': 'application/json' }),
        body: JSON.stringify(body),
    });
    return handleResponse<T>(response);
}

export async function apiDelete<T>(path: string, token?: string): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${path}`, {
        method: 'DELETE',
        headers: buildHeaders(token),
    });
    return handleResponse<T>(response);
}
