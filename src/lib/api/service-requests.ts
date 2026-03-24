// src/lib/api/service-requests.ts
import { API_BASE_URL } from '$lib/api/client';

// ---- Dynamic form types ----
export type DynamicFormType = 'SR' | 'MONTHLY_REPORT' | 'APPLICATION';

export interface DynamicFormField {
    field_id: string;
    label: string;
    field_type: 'text' | 'number' | 'date' | 'select' | 'checkbox' | 'textarea';
    required: boolean;
    options?: string[] | null;
    validation?: Record<string, unknown> | null;
}

export interface DynamicFormPage {
    page_index: number;
    title: string;
    fields: DynamicFormField[];
}

export interface DynamicFormSchema {
    form_type: DynamicFormType;
    sr_type?: SRType | null;
    pages: DynamicFormPage[];
    total_pages: number;
}

export interface SRDraftResponse {
    sr_id: string;
    sr_type: SRType;
    draft_json?: Record<string, unknown> | null;
    updated_at: string; // ISO 8601 datetime
}

export interface SRCreateRequest {
    sr_type: SRType;
}

export interface SRFormUpdateRequest {
    answers: Record<string, unknown>;
    page_index: number;
}

export type SRType =
    | 'ASSIST'
    | 'RREINSTATE'
    | 'CRISIS_FOOD'
    | 'CRISIS_SHELTER'
    | 'CRISIS_CLOTHING'
    | 'CRISIS_UTILITIES'
    | 'CRISIS_MED_TRANSPORT'
    | 'DIRECT_DEPOSIT'
    | 'DIET'
    | 'NATAL'
    | 'MED_TRANSPORT_LOCAL'
    | 'MED_TRANSPORT_NON_LOCAL'
    | 'RECONSIDERATION'
    | 'RECON_SUPPLEMENT'
    | 'RECON_EXTENSION'
    | 'STREAMLINED'
    | 'BUS_PASS'
    | 'PWD_DESIGNATION'
    | 'PPMB';

export interface SRSummary {
    sr_id: string;
    sr_type: SRType;
    sr_number: string;
    status: string;
    client_name: string;
    created_at: string; // ISO 8601 datetime
}

export interface SRListResponse {
    items: SRSummary[];
    total: number;
    page: number;
    page_size: number;
}

export interface SRTypeMetadata {
    sr_type: SRType;
    display_name: string;
    requires_pin: boolean;
    has_attachments: boolean;
    max_active: number;
}

async function apiGet<T>(path: string, token: string, params?: Record<string, string>): Promise<T> {
    const url = new URL(`${API_BASE_URL}${path}`);
    if (params) {
        for (const [key, value] of Object.entries(params)) {
            url.searchParams.set(key, value);
        }
    }
    const response = await fetch(url.toString(), {
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

export async function listServiceRequests(
    token: string,
    page: number = 1,
    pageSize: number = 20,
): Promise<SRListResponse> {
    return apiGet<SRListResponse>('/service-requests', token, {
        page: String(page),
        page_size: String(pageSize),
    });
}

export async function getEligibleTypes(
    token: string,
    caseStatus: string,
): Promise<SRTypeMetadata[]> {
    return apiGet<SRTypeMetadata[]>('/service-requests/eligible-types', token, {
        case_status: caseStatus,
    });
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
    return response.json() as Promise<T>;
}

async function apiPut<T>(path: string, token: string, body: unknown): Promise<T> {
    const url = `${API_BASE_URL}${path}`;
    const response = await fetch(url, {
        method: 'PUT',
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
    return response.json() as Promise<T>;
}

export async function createServiceRequest(
    token: string,
    request: SRCreateRequest,
): Promise<SRDraftResponse> {
    return apiPost<SRDraftResponse>('/service-requests', token, request);
}

export async function getDraft(
    token: string,
    srId: string,
): Promise<SRDraftResponse> {
    return apiGet<SRDraftResponse>(`/service-requests/${srId}/draft`, token);
}

export async function getFormSchema(
    token: string,
    srId: string,
    srType: SRType,
): Promise<DynamicFormSchema> {
    return apiGet<DynamicFormSchema>(`/service-requests/${srId}/form`, token, { sr_type: srType });
}

export async function updateFormDraft(
    token: string,
    srId: string,
    request: SRFormUpdateRequest,
): Promise<SRDraftResponse> {
    return apiPut<SRDraftResponse>(`/service-requests/${srId}/form`, token, request);
}

// ---- SR detail, submit, and withdraw ----

export interface SRDetailResponse {
    sr_id: string;
    sr_type: SRType;
    sr_number: string;
    status: string;
    client_name: string;
    created_at: string;
    answers?: Record<string, unknown> | null;
    attachments: string[];
}

export interface SRSubmitRequest {
    pin: string;
    spouse_pin?: string | null;
    declaration_accepted: boolean;
}

export interface SRSubmitResponse {
    sr_id: string;
    sr_number: string;
    submitted_at: string;
}

export async function getServiceRequestDetail(
    token: string,
    srId: string,
): Promise<SRDetailResponse> {
    return apiGet<SRDetailResponse>(`/service-requests/${srId}`, token);
}

export async function submitServiceRequest(
    token: string,
    srId: string,
    request: SRSubmitRequest,
): Promise<SRSubmitResponse> {
    return apiPost<SRSubmitResponse>(`/service-requests/${srId}/submit`, token, request);
}

export async function withdrawServiceRequest(
    token: string,
    srId: string,
    reason?: string,
): Promise<void> {
    const url = `${API_BASE_URL}/service-requests/${srId}/withdraw`;
    const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ reason: reason ?? null }),
    });
    if (!response.ok) {
        const error = await response.json().catch(() => ({ detail: 'Unknown error' }));
        throw new Error(`Request failed (${response.status}): ${JSON.stringify(error)}`);
    }
}
