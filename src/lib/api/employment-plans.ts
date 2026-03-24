// src/lib/api/employment-plans.ts
import { API_BASE_URL } from '$lib/api/client';

// ---- Types ----

export type EPStatus = 'Received' | 'Submitted' | 'PendingSignature';

export interface EmploymentPlan {
    ep_id: number;
    message_id: number | null;
    icm_attachment_id: string;
    status: EPStatus;
    plan_date: string;
    message_deleted: boolean;
}

export interface EPListResponse {
    plans: EmploymentPlan[];
}

export interface EPDetailResponse extends EmploymentPlan {}

export interface EPSignRequest {
    pin: string;
    message_id: number;
}

export interface EPSignResponse {
    ep_id: number;
    signed_at: string;
}

// ---- HTTP helpers ----

async function apiGet<T>(path: string, token: string): Promise<T> {
    const url = `${API_BASE_URL}${path}`;
    const response = await fetch(url, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    });
    if (!response.ok) {
        const error = await response.json().catch(() => ({ detail: 'Unknown error' }));
        throw new Error(`Request failed (${response.status}): ${JSON.stringify(error)}`);
    }
    return response.json() as Promise<T>;
}

async function apiPost<T>(path: string, token: string, body: unknown): Promise<T> {
    const url = `${API_BASE_URL}${path}`;
    const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(body),
    });
    if (!response.ok) {
        const error = await response.json().catch(() => ({ detail: 'Unknown error' }));
        throw new Error(`Request failed (${response.status}): ${JSON.stringify(error)}`);
    }
    return response.json() as Promise<T>;
}

// ---- API functions ----

export async function listPlans(token: string): Promise<EPListResponse> {
    return apiGet<EPListResponse>('/employment-plans', token);
}

export async function getPlanDetail(token: string, epId: number): Promise<EPDetailResponse> {
    return apiGet<EPDetailResponse>(`/employment-plans/${epId}`, token);
}

export async function signPlan(
    token: string,
    epId: number,
    request: EPSignRequest,
): Promise<EPSignResponse> {
    return apiPost<EPSignResponse>(`/employment-plans/${epId}/sign`, token, request);
}
