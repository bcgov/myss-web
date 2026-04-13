// src/lib/api/monthly-reports.ts
import { apiGet, apiPost, apiPut } from '$lib/api/client';

// ---- Types ----

export type SD81Status = 'PRT' | 'SUB' | 'RST' | 'RES' | 'PND';

export interface ChequeScheduleWindow {
    benefit_month: string; // YYYY-MM-DD
    income_date: string;
    cheque_issue_date: string;
    period_close_date: string; // ISO datetime
}

export interface SD81Summary {
    sd81_id: string;
    benefit_month: string;
    status: SD81Status;
    submitted_at: string | null;
}

export interface SD81ListResponse {
    reports: SD81Summary[];
    total: number;
}

// Backend returns raw dict of answers from ICM questionnaire
export type SD81AnswersResponse = Record<string, unknown>;

export interface SD81SubmitRequest {
    pin: string;
    spouse_pin?: string | null;
}

export interface SD81SubmitResponse {
    sd81_id: string;
    status: SD81Status;
    submitted_at: string;
}

// ---- API Functions ----

export async function getCurrentPeriod(token: string): Promise<ChequeScheduleWindow> {
    return apiGet<ChequeScheduleWindow>('/monthly-reports/current-period', token);
}

export async function listReports(token: string): Promise<SD81ListResponse> {
    return apiGet<SD81ListResponse>('/monthly-reports', token);
}

export async function startReport(token: string): Promise<{ sd81_id: string }> {
    return apiPost<{ sd81_id: string }>('/monthly-reports', token, {});
}

export async function getAnswers(token: string, sd81Id: string): Promise<SD81AnswersResponse> {
    return apiGet<SD81AnswersResponse>(`/monthly-reports/${sd81Id}/answers`, token);
}

export async function saveAnswers(
    token: string,
    sd81Id: string,
    answers: Record<string, unknown>,
): Promise<SD81AnswersResponse> {
    return apiPut<SD81AnswersResponse>(`/monthly-reports/${sd81Id}/answers`, token, answers);
}

export async function submitReport(
    token: string,
    sd81Id: string,
    request: SD81SubmitRequest,
): Promise<SD81SubmitResponse> {
    return apiPost<SD81SubmitResponse>(`/monthly-reports/${sd81Id}/submit`, token, request);
}

export async function restartReport(token: string, sd81Id: string): Promise<{ sd81_id: string; status: string }> {
    return apiPost<{ sd81_id: string; status: string }>(`/monthly-reports/${sd81Id}/restart`, token, {});
}
