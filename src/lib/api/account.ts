// src/lib/api/account.ts
import { apiGet, apiPatch, apiPost } from '$lib/api/client';

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
