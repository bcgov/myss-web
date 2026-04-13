// src/lib/api/employment-plans.ts
import { apiGet, apiPost } from '$lib/api/client';

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

export type EPDetailResponse = EmploymentPlan;

export interface EPSignRequest {
    pin: string;
    message_id: number;
}

export interface EPSignResponse {
    ep_id: number;
    signed_at: string;
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
