// src/lib/api/payment.ts
import { API_BASE_URL } from '$lib/api/client';

// ---- Types ----

export interface AllowanceItem {
    code: number;
    amount: number;
    description: string;
}

export interface DeductionItem {
    code: string;
    amount: number;
    description: string;
}

export interface SupplementItem {
    code: string;
    amount: number;
    effective_date: string;
}

export interface ServiceProviderPayment {
    provider_name: string;
    amount: number;
    payment_date: string;
}

export interface MISPaymentData {
    mis_person_id: string;
    key_player_name: string;
    spouse_name: string | null;
    payment_method: string;
    payment_distribution: string;
    allowances: AllowanceItem[];
    deductions: DeductionItem[];
    aee_balance: number | null;
}

export interface PaymentInfoResponse {
    upcoming_benefit_date: string;
    assistance_type: string;
    supplements: SupplementItem[];
    service_provider_payments: ServiceProviderPayment[];
    mis_data: MISPaymentData;
}

export interface ChequeScheduleResponse {
    benefit_month: string;
    income_date: string;
    cheque_issue_date: string;
    period_close_date: string;
}

export interface T5Slip {
    tax_year: number;
    box_10_amount: number;
    box_11_amount: number;
    available: boolean;
}

export interface T5SlipList {
    slips: T5Slip[];
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

// ---- API functions ----

export async function getPaymentInfo(token: string): Promise<PaymentInfoResponse> {
    return apiGet<PaymentInfoResponse>('/payment/info', token);
}

export async function getChequeSchedule(token: string): Promise<ChequeScheduleResponse> {
    return apiGet<ChequeScheduleResponse>('/payment/schedule', token);
}

export async function getMISData(token: string): Promise<MISPaymentData> {
    return apiGet<MISPaymentData>('/payment/mis-data', token);
}

export async function getT5Slips(token: string): Promise<T5SlipList> {
    return apiGet<T5SlipList>('/payment/t5-slips', token);
}

// T5 PDF download is a direct link: /payment/t5-slips/{year}
// No API function needed — use <a href> with download attribute
