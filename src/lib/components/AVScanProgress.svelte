<script lang="ts">
    import { onDestroy } from 'svelte';
    import { API_BASE_URL } from '$lib/api/client';
    import { uploadState, updateStatus, setError, resetUpload } from '$lib/stores/upload_store.svelte';

    let { scan_id, sr_id, token }: { scan_id: string; sr_id: string; token: string } = $props();

    let submitError = $state<string | null>(null);
    let submitSuccess = $state(false);
    let submitting = $state(false);
    let destroyed = $state(false);

    let isPending = $derived(uploadState.status === 'PENDING' || uploadState.status === 'SCANNING');
    let isClean = $derived(uploadState.status === 'CLEAN');

    const POLL_INTERVAL_MS = 2000;
    const MAX_POLL_ERRORS = 10;
    let consecutiveErrors = 0;

    async function pollStatus() {
        try {
            const response = await fetch(`${API_BASE_URL}/attachments/upload/${scan_id}/status`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (destroyed) return;

            if (!response.ok) {
                consecutiveErrors++;
                if (consecutiveErrors >= MAX_POLL_ERRORS) {
                    stopPolling();
                    setError('Unable to get scan status. Please refresh and try again.');
                }
                return;
            }

            consecutiveErrors = 0;
            const data = await response.json();
            const newStatus: string = data.status;

            if (newStatus === 'CLEAN' || newStatus === 'INFECTED' || newStatus === 'PENDING' || newStatus === 'SCANNING') {
                updateStatus(newStatus as 'CLEAN' | 'INFECTED' | 'PENDING' | 'SCANNING');
            }

            if (newStatus === 'CLEAN' || newStatus === 'INFECTED') {
                stopPolling();
                if (newStatus === 'INFECTED') {
                    setError('This file could not be accepted because it failed the security scan. Please ensure your file is free of viruses and try again.');
                }
            }
        } catch {
            if (destroyed) return;
            consecutiveErrors++;
            if (consecutiveErrors >= MAX_POLL_ERRORS) {
                stopPolling();
                setError('Unable to reach the server. Please check your connection and try again.');
            }
        }
    }

    let intervalId: ReturnType<typeof setInterval> | null = setInterval(pollStatus, POLL_INTERVAL_MS);

    function stopPolling() {
        if (intervalId !== null) {
            clearInterval(intervalId);
            intervalId = null;
        }
    }

    onDestroy(() => {
        destroyed = true;
        stopPolling();
    });

    async function attachToSR() {
        submitting = true;
        submitError = null;

        try {
            const response = await fetch(`${API_BASE_URL}/attachments/sr/${sr_id}/submit`, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    scan_id: uploadState.scan_id,
                    filename: uploadState.filename,
                }),
            });

            if (!response.ok) {
                const text = await response.text().catch(() => '');
                throw new Error(`Submit failed (${response.status})${text ? ': ' + text : ''}`);
            }

            submitSuccess = true;
        } catch (e) {
            submitError = e instanceof Error ? e.message : 'Failed to attach file. Please try again.';
        } finally {
            submitting = false;
        }
    }

    function handleDone() {
        resetUpload();
    }
</script>

<div class="av-scan-progress">
    {#if submitSuccess}
        <div class="success-banner" role="status" aria-live="polite">
            <svg class="icon" aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
            <p><strong>{uploadState.filename}</strong> has been successfully attached to your service request.</p>
        </div>
        <button class="done-btn" onclick={handleDone}>Upload another file</button>
    {:else if isClean}
        <div class="clean-panel">
            <div class="file-info">
                <svg class="icon icon-file" aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                </svg>
                <span class="filename">{uploadState.filename}</span>
                <span class="scan-badge">Scan passed</span>
            </div>

            {#if submitError}
                <div class="error-banner" role="alert" aria-live="assertive">
                    <p>{submitError}</p>
                </div>
            {/if}

            <button
                class="attach-btn"
                onclick={attachToSR}
                disabled={submitting}
            >
                {#if submitting}
                    <span class="spinner" aria-hidden="true"></span>
                    Attaching...
                {:else}
                    Attach to Service Request
                {/if}
            </button>
        </div>
    {:else if isPending}
        <div class="scanning-panel" aria-live="polite">
            <span class="spinner" aria-hidden="true"></span>
            <div class="scanning-text">
                <p class="scanning-title">Scanning file for viruses...</p>
                <p class="scanning-filename">{uploadState.filename}</p>
            </div>
        </div>
    {/if}
</div>

<style>
    .av-scan-progress {
        font-family: 'BC Sans', Arial, sans-serif;
        max-width: 600px;
    }

    .scanning-panel {
        display: flex;
        align-items: center;
        gap: 1rem;
        padding: 1.25rem;
        background: #f0f4f8;
        border: 1px solid #c3d4e4;
        border-radius: 6px;
    }

    .scanning-text {
        flex: 1;
    }

    .scanning-title {
        margin: 0 0 0.25rem;
        font-weight: 600;
        color: #003366;
        font-size: 0.95rem;
    }

    .scanning-filename {
        margin: 0;
        color: #555;
        font-size: 0.85rem;
    }

    .clean-panel {
        padding: 1.25rem;
        background: #f0fdf4;
        border: 1px solid #bbf7d0;
        border-radius: 6px;
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
    }

    .file-info {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        flex-wrap: wrap;
    }

    .icon-file {
        width: 1.25rem;
        height: 1.25rem;
        color: #166534;
        flex-shrink: 0;
    }

    .filename {
        font-weight: 600;
        color: #111827;
        font-size: 0.95rem;
        flex: 1;
        word-break: break-all;
    }

    .scan-badge {
        background: #dcfce7;
        color: #166534;
        border: 1px solid #bbf7d0;
        border-radius: 12px;
        padding: 0.15rem 0.6rem;
        font-size: 0.75rem;
        font-weight: 600;
        white-space: nowrap;
    }

    .attach-btn {
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
        background-color: #003366;
        color: #fff;
        border: none;
        border-radius: 4px;
        padding: 0.6rem 1.25rem;
        font-size: 0.95rem;
        font-weight: 600;
        font-family: inherit;
        cursor: pointer;
        transition: background-color 0.2s;
        align-self: flex-start;
    }

    .attach-btn:hover:not(:disabled) {
        background-color: #002244;
    }

    .attach-btn:disabled {
        background-color: #6b7280;
        cursor: wait;
    }

    .done-btn {
        display: inline-block;
        background: none;
        border: none;
        color: #003366;
        font-weight: 600;
        font-size: 0.9rem;
        cursor: pointer;
        text-decoration: underline;
        font-family: inherit;
        padding: 0.5rem 0;
        align-self: flex-start;
    }

    .done-btn:hover {
        color: #002244;
    }

    .success-banner {
        display: flex;
        align-items: flex-start;
        gap: 0.75rem;
        background: #dcfce7;
        color: #166534;
        border: 1px solid #bbf7d0;
        border-radius: 6px;
        padding: 1rem 1.25rem;
        font-size: 0.95rem;
    }

    .success-banner p {
        margin: 0;
    }

    .error-banner {
        display: flex;
        align-items: flex-start;
        gap: 0.75rem;
        background: #f8d7da;
        color: #721c24;
        border: 1px solid #f5c6cb;
        border-radius: 6px;
        padding: 1rem 1.25rem;
        font-size: 0.9rem;
    }

    .error-banner p {
        margin: 0;
        flex: 1;
    }

    .icon {
        width: 1.5rem;
        height: 1.5rem;
        flex-shrink: 0;
        margin-top: 0.1rem;
    }

    .spinner {
        display: inline-block;
        width: 1.5rem;
        height: 1.5rem;
        border: 3px solid #e5e7eb;
        border-top-color: #003366;
        border-radius: 50%;
        animation: spin 0.8s linear infinite;
        flex-shrink: 0;
    }

    @keyframes spin {
        to { transform: rotate(360deg); }
    }
</style>
