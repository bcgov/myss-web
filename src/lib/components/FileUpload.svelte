<script lang="ts">
    import { API_BASE_URL } from '$lib/api/client';
    import { uploadState, setUploading, setScanId, setError, resetUpload } from '$lib/stores/upload_store.svelte';
    import AVScanProgress from './AVScanProgress.svelte';

    let { sr_id, token }: { sr_id: string; token: string } = $props();

    const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
    const ALLOWED_MIME_TYPES = new Set([
        'application/pdf',
        'image/jpeg',
        'image/png',
        'image/gif',
        'image/bmp',
        'image/tiff',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    ]);

    let dragOver = $state(false);
    let fileInput: HTMLInputElement;

    let isUploading = $derived(uploadState.status === 'UPLOADING');

    function validateFile(file: File): string | null {
        if (file.size > MAX_FILE_SIZE) {
            return `File "${file.name}" exceeds the 5MB size limit (${(file.size / 1024 / 1024).toFixed(1)} MB).`;
        }
        if (!ALLOWED_MIME_TYPES.has(file.type)) {
            return `File type "${file.type || 'unknown'}" is not allowed. Please upload a PDF, image, or Office document.`;
        }
        return null;
    }

    async function handleFile(file: File) {
        const validationError = validateFile(file);
        if (validationError) {
            setError(validationError);
            return;
        }

        setUploading(file.name);

        try {
            const formData = new FormData();
            formData.append('file', file);

            const response = await fetch(`${API_BASE_URL}/attachments/upload`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}` },
                body: formData,
            });

            if (!response.ok) {
                const text = await response.text().catch(() => '');
                throw new Error(`Upload failed (${response.status})${text ? ': ' + text : ''}`);
            }

            const data = await response.json();
            setScanId(data.scan_id, file.name);
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Upload failed. Please try again.');
        }
    }

    function onFileInputChange(event: Event) {
        const input = event.target as HTMLInputElement;
        if (input.files && input.files.length > 0) {
            handleFile(input.files[0]);
            input.value = '';
        }
    }

    function onDrop(event: DragEvent) {
        event.preventDefault();
        dragOver = false;
        if (event.dataTransfer?.files && event.dataTransfer.files.length > 0) {
            handleFile(event.dataTransfer.files[0]);
        }
    }

    function onDragOver(event: DragEvent) {
        event.preventDefault();
        dragOver = true;
    }

    function onDragLeave() {
        dragOver = false;
    }

    function onDropZoneKeydown(event: KeyboardEvent) {
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            fileInput.click();
        }
    }

    function handleReset() {
        resetUpload();
    }
</script>

<div class="file-upload">
    {#if uploadState.status === 'IDLE' || uploadState.status === 'UPLOADING'}
        {#if uploadState.error}
            <div class="error-banner" role="alert">
                <p>{uploadState.error}</p>
                <button class="dismiss-btn" onclick={handleReset}>Dismiss</button>
            </div>
        {/if}

        <div
            class="drop-zone"
            class:drag-over={dragOver}
            class:uploading={uploadState.status === 'UPLOADING'}
            role="button"
            tabindex={isUploading ? -1 : 0}
            aria-label="Click or drag and drop a file to upload"
            aria-disabled={isUploading}
            ondrop={(e) => { if (!isUploading) onDrop(e); else e.preventDefault(); }}
            ondragover={onDragOver}
            ondragleave={onDragLeave}
            onclick={() => { if (!isUploading) fileInput.click(); }}
            onkeydown={(e) => { if (!isUploading) onDropZoneKeydown(e); }}
        >
            {#if uploadState.status === 'UPLOADING'}
                <div class="uploading-indicator" aria-live="polite">
                    <span class="spinner" aria-hidden="true"></span>
                    <p>Uploading <strong>{uploadState.filename}</strong>...</p>
                </div>
            {:else}
                <div class="drop-zone-content">
                    <svg class="upload-icon" aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                        <polyline points="17 8 12 3 7 8" />
                        <line x1="12" y1="3" x2="12" y2="15" />
                    </svg>
                    <p class="drop-text">Drag and drop a file here, or <span class="browse-link">browse</span></p>
                    <p class="file-hint">PDF, images, or Office documents up to 5 MB</p>
                </div>
            {/if}
        </div>

        <input
            bind:this={fileInput}
            type="file"
            class="sr-only"
            accept=".pdf,.jpg,.jpeg,.png,.gif,.bmp,.tif,.tiff,.doc,.docx,.xls,.xlsx"
            onchange={onFileInputChange}
            aria-hidden="true"
            tabindex="-1"
        />
    {:else if uploadState.scan_id}
        <AVScanProgress
            scan_id={uploadState.scan_id}
            {sr_id}
            {token}
        />
    {/if}
</div>

<style>
    .file-upload {
        font-family: 'BC Sans', Arial, sans-serif;
        max-width: 600px;
    }

    .error-banner {
        background: #f8d7da;
        color: #721c24;
        border: 1px solid #f5c6cb;
        border-radius: 4px;
        padding: 0.75rem 1rem;
        margin-bottom: 0.75rem;
        font-size: 0.9rem;
        display: flex;
        align-items: flex-start;
        gap: 0.75rem;
    }

    .error-banner p {
        margin: 0;
        flex: 1;
    }

    .dismiss-btn {
        background: none;
        border: none;
        color: #721c24;
        font-weight: 600;
        cursor: pointer;
        font-size: 0.85rem;
        padding: 0;
        white-space: nowrap;
        text-decoration: underline;
        font-family: inherit;
    }

    .dismiss-btn:hover {
        color: #491217;
    }

    .drop-zone {
        border: 2px dashed #a0aec0;
        border-radius: 6px;
        padding: 2rem;
        text-align: center;
        cursor: pointer;
        transition: border-color 0.2s, background-color 0.2s;
        background-color: #f9fafb;
        outline: none;
    }

    .drop-zone:hover,
    .drop-zone:focus {
        border-color: #003366;
        background-color: #f0f4f8;
    }

    .drop-zone.drag-over {
        border-color: #003366;
        background-color: #e8f0fb;
    }

    .drop-zone.uploading {
        cursor: default;
        border-color: #a0aec0;
        background-color: #f9fafb;
    }

    .drop-zone-content {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 0.5rem;
    }

    .upload-icon {
        width: 2.5rem;
        height: 2.5rem;
        color: #6b7280;
    }

    .drop-text {
        margin: 0;
        color: #374151;
        font-size: 0.95rem;
    }

    .browse-link {
        color: #003366;
        text-decoration: underline;
        font-weight: 600;
    }

    .file-hint {
        margin: 0;
        color: #6b7280;
        font-size: 0.8rem;
    }

    .uploading-indicator {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 0.75rem;
        color: #374151;
    }

    .uploading-indicator p {
        margin: 0;
        font-size: 0.95rem;
    }

    .spinner {
        display: inline-block;
        width: 2rem;
        height: 2rem;
        border: 3px solid #e5e7eb;
        border-top-color: #003366;
        border-radius: 50%;
        animation: spin 0.8s linear infinite;
    }

    @keyframes spin {
        to { transform: rotate(360deg); }
    }

    .sr-only {
        position: absolute;
        width: 1px;
        height: 1px;
        padding: 0;
        margin: -1px;
        overflow: hidden;
        clip: rect(0, 0, 0, 0);
        white-space: nowrap;
        border-width: 0;
    }
</style>
