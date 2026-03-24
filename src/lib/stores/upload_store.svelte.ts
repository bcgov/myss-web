// src/lib/stores/upload_store.svelte.ts

export interface UploadState {
    scan_id: string | null;
    status: 'IDLE' | 'UPLOADING' | 'PENDING' | 'SCANNING' | 'CLEAN' | 'INFECTED';
    filename: string | null;
    error: string | null;
}

export const uploadState = $state<UploadState>({
    scan_id: null,
    status: 'IDLE',
    filename: null,
    error: null,
});

export function resetUpload(): void {
    uploadState.scan_id = null;
    uploadState.status = 'IDLE';
    uploadState.filename = null;
    uploadState.error = null;
}

export function setUploading(filename: string): void {
    uploadState.status = 'UPLOADING';
    uploadState.filename = filename;
    uploadState.error = null;
    uploadState.scan_id = null;
}

export function setScanId(scan_id: string, filename: string): void {
    uploadState.scan_id = scan_id;
    uploadState.filename = filename;
    uploadState.status = 'PENDING';
    uploadState.error = null;
}

export function updateStatus(status: UploadState['status']): void {
    uploadState.status = status;
}

export function setError(error: string): void {
    uploadState.status = 'IDLE';
    uploadState.error = error;
}

export function clearFile(): void {
    uploadState.scan_id = null;
    uploadState.filename = null;
    uploadState.status = 'IDLE';
}
