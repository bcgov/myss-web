// src/lib/api/client.ts
export const API_BASE_URL =
    (typeof import.meta !== 'undefined' && import.meta.env?.PUBLIC_API_BASE_URL) ??
    'http://localhost:8000';
