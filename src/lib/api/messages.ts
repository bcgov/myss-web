// src/lib/api/messages.ts
import { apiGet, apiPost, apiDelete } from '$lib/api/client';

// ---- Types ----

export type ICMMessageType =
    | 'HR0081'
    | 'HR0081Restart'
    | 'HR0081StreamlinedRestart'
    | 'HR0081 Pending Documents'
    | 'FormSubmission'
    | 'General';

export interface BannerNotification {
    notification_id: string;
    body: string;
    start_date: string;
    end_date: string;
}

export interface MessageSummary {
    message_id: string;
    subject: string;
    sent_date: string;
    is_read: boolean;
    can_reply: boolean;
    message_type: ICMMessageType;
}

export interface InboxListResponse {
    messages: MessageSummary[];
    total: number;
}

export interface MessageDetail extends MessageSummary {
    body: string;
    attachments: string[];
}

export interface ReplyRequest {
    body: string;
    attachment_ids?: string[];
}

export interface ReplyResponse {
    status: string;
    sent_at: string;
}

// ---- API functions ----

export interface BannerListResponse {
    banners: BannerNotification[];
}

export async function getBanners(token: string): Promise<BannerNotification[]> {
    const response = await apiGet<BannerListResponse>('/notifications/banners', token);
    return response.banners;
}

export async function listMessages(token: string, page: number = 1): Promise<InboxListResponse> {
    return apiGet<InboxListResponse>('/messages', token, { page: String(page) });
}

export async function getMessageDetail(token: string, msgId: string): Promise<MessageDetail> {
    return apiGet<MessageDetail>(`/messages/${msgId}`, token);
}

export async function replyToMessage(
    token: string,
    msgId: string,
    request: ReplyRequest,
): Promise<ReplyResponse> {
    return apiPost<ReplyResponse>(`/messages/${msgId}/reply`, token, request);
}

export async function deleteMessage(token: string, msgId: string): Promise<void> {
    return apiDelete(`/messages/${msgId}`, token);
}

export async function signMessage(token: string, msgId: string, pin: string): Promise<void> {
    await apiPost<unknown>(`/messages/${msgId}/sign`, token, { pin });
}
