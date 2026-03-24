<script lang="ts">
    import { onMount, onDestroy } from 'svelte';

    let {
        clientName,
        expiresAt,
        onend,
        onexpired,
    }: {
        clientName: string;
        expiresAt: string; // ISO datetime
        onend?: () => void;
        onexpired?: () => void;
    } = $props();

    let remainingLabel: string = $state('');
    let intervalId: ReturnType<typeof setInterval> | null = null;

    function computeRemaining(): { minutes: number; expired: boolean } {
        const now = Date.now();
        const expiry = new Date(expiresAt).getTime();
        const diffMs = expiry - now;
        if (diffMs <= 0) {
            return { minutes: 0, expired: true };
        }
        return { minutes: Math.ceil(diffMs / 60_000), expired: false };
    }

    function updateLabel() {
        const { minutes, expired } = computeRemaining();
        if (expired) {
            remainingLabel = 'Session expired';
            onexpired?.();
            stopTimer();
        } else {
            remainingLabel = `${minutes} minute${minutes !== 1 ? 's' : ''} remaining`;
        }
    }

    function stopTimer() {
        if (intervalId !== null) {
            clearInterval(intervalId);
            intervalId = null;
        }
    }

    onMount(() => {
        updateLabel();
        intervalId = setInterval(updateLabel, 30_000);
    });

    onDestroy(() => {
        stopTimer();
    });

    function handleEnd() {
        onend?.();
    }
</script>

<div class="support-banner" role="status" aria-live="polite">
    <div class="support-banner__info">
        <span class="support-banner__icon" aria-hidden="true">⚠</span>
        <span class="support-banner__label">
            Support View — viewing as: <strong>{clientName}</strong>
        </span>
        <span class="support-banner__timer">{remainingLabel}</span>
    </div>
    <button class="support-banner__end-btn" type="button" onclick={handleEnd}>
        End Support View
    </button>
</div>

<style>
    .support-banner {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 1rem;
        background: #fff3cd;
        border: 1px solid #ffc107;
        border-left: 4px solid #d39e00;
        border-radius: 4px;
        padding: 0.75rem 1rem;
        margin-bottom: 1.25rem;
        font-family: 'BC Sans', Arial, sans-serif;
    }

    .support-banner__info {
        display: flex;
        align-items: center;
        gap: 0.6rem;
        flex-wrap: wrap;
    }

    .support-banner__icon {
        font-style: normal;
        font-size: 1.1rem;
        color: #856404;
        flex-shrink: 0;
    }

    .support-banner__label {
        font-size: 0.95rem;
        color: #664d03;
    }

    .support-banner__label strong {
        font-weight: 700;
    }

    .support-banner__timer {
        font-size: 0.85rem;
        color: #856404;
        font-style: italic;
    }

    .support-banner__end-btn {
        padding: 0.4rem 0.9rem;
        background: #856404;
        color: #fff;
        border: none;
        border-radius: 4px;
        font-size: 0.875rem;
        font-weight: 600;
        cursor: pointer;
        white-space: nowrap;
        transition: background-color 0.15s;
        flex-shrink: 0;
    }

    .support-banner__end-btn:hover {
        background: #664d03;
    }
</style>
