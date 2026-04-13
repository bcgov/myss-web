// src/lib/api/admin.ts
import { apiGet, apiPost, apiDelete } from '$lib/api/client';

// ---- Types ----

export interface ClientSearchParams {
    first_name?: string;
    last_name?: string;
    sin?: string;
    page?: number;
}

export interface ClientSearchResult {
    bceid_guid: string;
    first_name: string;
    last_name: string;
    sin_masked: string;
    case_number: string | null;
}

export interface ClientSearchResponse {
    items: ClientSearchResult[];
    total: number;
    page: number;
    page_size: number;
}

export interface TombstoneResponse {
    session_token: string;
    client_bceid_guid: string;
    expires_at: string; // ISO datetime
}

export interface IAApplication {
    application_id: string;
    sr_number: string;
    client_name: string;
    status: string;
    submitted_at: string;
}

export interface IAApplicationListResponse {
    items: IAApplication[];
}

export interface AOLoginRequest {
    sr_number: string;
    sin: string;
}

export interface AOLoginResponse {
    success: boolean;
    client_name: string;
    sr_number: string;
}

// ---- API functions ----

/** Search for clients by name/SIN. Returns a paginated list of matching clients. */
export async function searchClients(
    token: string,
    params: ClientSearchParams,
): Promise<ClientSearchResponse> {
    return apiPost<ClientSearchResponse>('/admin/support-view/search', token, params);
}

/** Create a support-view tombstone session for the given client. */
export async function createTombstone(
    token: string,
    clientBceidGuid: string,
): Promise<TombstoneResponse> {
    return apiPost<TombstoneResponse>('/admin/support-view/tombstone', token, {
        client_bceid_guid: clientBceidGuid,
    });
}

/** End the active support-view tombstone session for the given client. */
export async function endTombstone(
    token: string,
    clientBceidGuid: string,
): Promise<void> {
    return apiDelete<void>('/admin/support-view/tombstone', token, {
        'X-Support-View-Client': clientBceidGuid,
    });
}

/** Fetch client data for a specific resource while in support-view mode. */
export async function getClientData<T = unknown>(
    token: string,
    resource: string,
    clientBceidGuid: string,
): Promise<T> {
    return apiGet<T>(`/admin/support-view/client-data/${resource}`, token, undefined, {
        'X-Support-View-Client': clientBceidGuid,
    });
}

/** Perform AO login with SR number and SIN. */
export async function aoLogin(
    token: string,
    srNumber: string,
    sin: string,
): Promise<AOLoginResponse> {
    return apiPost<AOLoginResponse>('/admin/ao/login', token, { sr_number: srNumber, sin });
}

/** List IA applications visible to the current AO worker. */
export async function listIAApplications(token: string): Promise<IAApplicationListResponse> {
    return apiGet<IAApplicationListResponse>('/admin/ao/ia-applications', token);
}
