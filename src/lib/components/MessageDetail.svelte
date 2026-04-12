<script lang="ts">
    import type { MessageDetail } from '$lib/api/messages';
    import { formatDate } from '$lib/utils/format-date';

    let {
        message = null,
        onreply,
        ondelete,
        onrestart,
    }: {
        message?: MessageDetail | null;
        onreply?: () => void;
        ondelete?: (messageId: string) => void;
        onrestart?: (messageId: string) => void;
    } = $props();

    let restartClicked: boolean = $state(false);

    function handleRestart() {
        restartClicked = true;
        if (message) {
            onrestart?.(message.message_id);
        }
    }

    let isRestartType = $derived(
        message?.message_type === 'HR0081Restart' ||
        message?.message_type === 'HR0081StreamlinedRestart',
    );

    // Reset restart button when a new message is loaded
    $effect(() => {
        if (message) {
            restartClicked = false;
        }
    });
</script>

<div class="detail">
    {#if message === null}
        <div class="placeholder">
            <p>Select a message to view its contents.</p>
        </div>
    {:else}
        <div class="detail-header">
            <h2 class="subject">{message.subject}</h2>
            <p class="meta">Sent {formatDate(message.sent_date)}</p>
        </div>

        <div class="detail-body">
            <p class="body-text">{message.body}</p>
        </div>

        {#if message.attachments && message.attachments.length > 0}
            <div class="attachments">
                <h3 class="attachments-title">Attachments</h3>
                <ul class="attachment-list">
                    {#each message.attachments as attachment}
                        <li class="attachment-item">
                            <span class="attachment-icon" aria-hidden="true">📎</span>
                            {attachment}
                        </li>
                    {/each}
                </ul>
            </div>
        {/if}

        <div class="actions">
            {#if message.can_reply}
                <button class="btn btn-primary" onclick={() => onreply?.()}>
                    Reply
                </button>
            {/if}

            {#if isRestartType}
                <button
                    class="btn btn-secondary"
                    disabled={restartClicked}
                    onclick={handleRestart}
                >
                    {restartClicked ? 'Restarting...' : 'Restart Monthly Report'}
                </button>
            {/if}

            <button
                class="btn btn-danger"
                onclick={() => message && ondelete?.(message.message_id)}
            >
                Delete
            </button>
        </div>
    {/if}
</div>

<style>
    .detail {
        font-family: 'BC Sans', Arial, sans-serif;
        height: 100%;
    }

    .placeholder {
        display: flex;
        align-items: center;
        justify-content: center;
        height: 200px;
        color: #888;
        font-style: italic;
        border: 1px dashed #ccc;
        border-radius: 4px;
    }

    .detail-header {
        border-bottom: 2px solid #003366;
        padding-bottom: 0.75rem;
        margin-bottom: 1rem;
    }

    .subject {
        font-size: 1.25rem;
        color: #003366;
        margin: 0 0 0.25rem;
    }

    .meta {
        font-size: 0.85rem;
        color: #666;
        margin: 0;
    }

    .detail-body {
        margin-bottom: 1.25rem;
    }

    .body-text {
        line-height: 1.6;
        color: #333;
        white-space: pre-wrap;
        margin: 0;
    }

    .attachments {
        background: #f8f9fa;
        border: 1px solid #dee2e6;
        border-radius: 4px;
        padding: 0.75rem 1rem;
        margin-bottom: 1.25rem;
    }

    .attachments-title {
        font-size: 0.95rem;
        font-weight: 600;
        color: #333;
        margin: 0 0 0.5rem;
    }

    .attachment-list {
        list-style: none;
        margin: 0;
        padding: 0;
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
    }

    .attachment-item {
        font-size: 0.9rem;
        color: #003366;
        display: flex;
        align-items: center;
        gap: 0.4rem;
    }

    .actions {
        display: flex;
        gap: 0.75rem;
        flex-wrap: wrap;
    }

    .btn {
        padding: 0.5rem 1.25rem;
        border-radius: 4px;
        font-size: 0.95rem;
        font-family: 'BC Sans', Arial, sans-serif;
        cursor: pointer;
        border: none;
        font-weight: 600;
    }

    .btn-primary {
        background: #003366;
        color: white;
    }

    .btn-primary:hover {
        background: #002244;
    }

    .btn-secondary {
        background: white;
        color: #003366;
        border: 1px solid #003366;
    }

    .btn-secondary:hover:not(:disabled) {
        background: #f0f4f8;
    }

    .btn-secondary:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }

    .btn-danger {
        background: white;
        color: #721c24;
        border: 1px solid #f5c6cb;
    }

    .btn-danger:hover {
        background: #f8d7da;
    }
</style>
