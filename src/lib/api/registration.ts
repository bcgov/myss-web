// src/lib/api/registration.ts
import { apiPost } from '$lib/api/client';

export type AccountCreationType = 'SELF' | 'WITH_HELPER' | 'POA' | 'PARENT';

export interface PersonalInfoPayload {
    first_name: string;
    middle_name?: string;
    last_name: string;
    email: string;
    email_confirm: string;
    sin: string;
    phn?: string;
    date_of_birth: string;    // ISO 8601 YYYY-MM-DD
    gender: string;
    phone_number: string;
    phone_type: string;
    has_open_case: boolean;
    spouse?: SpouseInfoPayload;
}

export interface SpouseInfoPayload {
    first_name: string;
    middle_name?: string;
    last_name: string;
    sin: string;
    phn?: string;
    date_of_birth: string;
    gender: string;
}

export interface StartRegistrationResponse {
    token: string;
}

export interface StepResponse {
    next_step: number;
}

export async function startRegistration(
    accountCreationType: AccountCreationType,
): Promise<StartRegistrationResponse> {
    return apiPost<StartRegistrationResponse>('/registration/start', '', {
        account_creation_type: accountCreationType,
    });
}

export async function savePersonalInfo(
    token: string,
    payload: PersonalInfoPayload,
): Promise<StepResponse> {
    return apiPost<StepResponse>(`/registration/${token}/personal-info`, '', payload);
}

export async function savePin(
    token: string,
    pin: string,
    pinConfirm: string,
): Promise<StepResponse> {
    return apiPost<StepResponse>(`/registration/${token}/pin`, '', {
        pin,
        pin_confirm: pinConfirm,
    });
}
