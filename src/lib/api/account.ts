// src/lib/api/account.ts
import { API_BASE_URL } from '$lib/api/client';

// ---- Types ----

export type PhoneNumberOperation = 'ADD' | 'UPDATE' | 'DELETE';

export interface PhoneNumberUpdate {
    phone_id: number | null;
    phone_number: string;
    phone_type: string;
    operation: PhoneNumberOperation;
}

export interface UpdateContactRequest {
    email: string | null;
    email_confirm: string | null;
    phones: PhoneNumberUpdate[];
}

export interface AccountInfoResponse {
    user_id: string;
    email: string | null;
    phone_numbers: Array<{ phone_id: number; phone_number: string; phone_type: string }>;
    case_number: string | null;
    case_status: string | null;
}

export interface CaseMember {
    name: string;
    relationship: string;
}

export interface CaseMemberListResponse {
    members: CaseMember[];
}

export interface PINChangeRequest {
    current_pin: string;
    new_pin: string;
}

// ---- HTTP helpers ----

async function apiGet<T>(path: string, token: string): Promise<T> {
    const url = `${API_BASE_URL}${path}`;
    const response = await fetch(url, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
        },
    });
    if (!response.ok) {
        const error = await response.json().catch(() => ({ detail: 'Unknown error' }));
        throw new Error(`Request failed (${response.status}): ${JSON.stringify(error)}`);
    }
    return response.json() as Promise<T>;
}

async function apiPatch<T>(path: string, token: string, body: unknown): Promise<T> {
    const url = `${API_BASE_URL}${path}`;
    const response = await fetch(url, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
    });
    if (!response.ok) {
        const error = await response.json().catch(() => ({ detail: 'Unknown error' }));
        throw new Error(`Request failed (${response.status}): ${JSON.stringify(error)}`);
    }
    // PATCH may return 204 No Content
    if (response.status === 204) {
        return undefined as T;
    }
    return response.json() as Promise<T>;
}

async function apiPost<T>(path: string, token: string, body: unknown): Promise<T> {
    const url = `${API_BASE_URL}${path}`;
    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
    });
    if (!response.ok) {
        const error = await response.json().catch(() => ({ detail: 'Unknown error' }));
        throw new Error(`Request failed (${response.status}): ${JSON.stringify(error)}`);
    }
    // POST may return 204 No Content
    if (response.status === 204) {
        return undefined as T;
    }
    return response.json() as Promise<T>;
}

// ---- API functions ----

export async function getProfile(token: string): Promise<AccountInfoResponse> {
    return apiGet<AccountInfoResponse>('/account/profile', token);
}

export async function updateContact(token: string, request: UpdateContactRequest): Promise<void> {
    await apiPatch<void>('/account/contact', token, request);
}

export async function getCaseMembers(token: string): Promise<CaseMemberListResponse> {
    return apiGet<CaseMemberListResponse>('/account/case-members', token);
}

export async function changePin(token: string, request: PINChangeRequest): Promise<void> {
    await apiPost<void>('/auth/pin/change', token, request);
}
