<script lang="ts">
    import type { MessageSummary } from '$lib/api/messages';

    let {
        messages = [],
        total = 0,
        loading = false,
        onselect,
        onloadMore,
    }: {
        messages?: MessageSummary[];
        total?: number;
        loading?: boolean;
        onselect?: (messageId: string) => void;
        onloadMore?: () => void;
    } = $props();

    let selectedId: string | null = $state(null);

    function handleSelect(messageId: string) {
        selectedId = messageId;
        onselect?.(messageId);
    }

    function formatDate(isoString: string): string {
        try {
            return new Intl.DateTimeFormat('en-CA', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
            }).format(new Date(isoString));
        } catch {
            return isoString;
        }
    }

    let hasMore = $derived(messages.length < total);
</script>

<div class="inbox">
    {#if loading && messages.length === 0}
        <p class="loading">Loading messages...</p>
    {:else if messages.length === 0}
        <p class="empty">You have no messages.</p>
    {:else}
        <p class="summary">
            Showing {messages.length} of {total} message{total !== 1 ? 's' : ''}
        </p>

        <ul class="message-list" role="list">
            {#each messages as msg (msg.message_id)}
                <li
                    class="message-item"
                    class:unread={!msg.is_read}
                    class:selected={selectedId === msg.message_id}
                    role="listitem"
                >
                    <button
                        class="message-btn"
                        onclick={() => handleSelect(msg.message_id)}
                        aria-current={selectedId === msg.message_id ? 'true' : undefined}
                    >
                        <span class="message-subject">{msg.subject}</span>
                        <span class="message-date">{formatDate(msg.sent_date)}</span>
                    </button>
                </li>
            {/each}
        </ul>

        {#if hasMore}
            <div class="show-more">
                <button
                    disabled={loading}
                    onclick={() => onloadMore?.()}
                >
                    {loading ? 'Loading...' : 'Show More'}
                </button>
            </div>
        {/if}
    {/if}
</div>

<style>
    .inbox {
        font-family: 'BC Sans', Arial, sans-serif;
    }

    .loading,
    .empty {
        color: #555;
        font-style: italic;
        padding: 1rem 0;
    }

    .summary {
        font-size: 0.875rem;
        color: #555;
        margin-bottom: 0.5rem;
    }

    .message-list {
        list-style: none;
        margin: 0;
        padding: 0;
        border: 1px solid #dee2e6;
        border-radius: 4px;
        overflow: hidden;
    }

    .message-item {
        border-bottom: 1px solid #dee2e6;
    }

    .message-item:last-child {
        border-bottom: none;
    }

    .message-item.unread {
        border-left: 4px solid #FCBA19;
    }

    .message-item.unread .message-subject {
        font-weight: 700;
    }

    .message-item.selected {
        background-color: #e8f0f8;
    }

    .message-btn {
        display: flex;
        justify-content: space-between;
        align-items: center;
        width: 100%;
        padding: 0.75rem 1rem;
        background: none;
        border: none;
        cursor: pointer;
        text-align: left;
        gap: 0.5rem;
        color: inherit;
        font-family: inherit;
        font-size: 0.95rem;
    }

    .message-btn:hover {
        background-color: #f5f8fb;
    }

    .message-subject {
        flex: 1;
        color: #003366;
        font-weight: 400;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }

    .message-date {
        font-size: 0.8rem;
        color: #666;
        white-space: nowrap;
        flex-shrink: 0;
    }

    .show-more {
        text-align: center;
        margin-top: 1rem;
    }

    .show-more button {
        padding: 0.5rem 1.5rem;
        cursor: pointer;
        border: 1px solid #003366;
        background: white;
        color: #003366;
        border-radius: 4px;
        font-size: 0.9rem;
        font-family: 'BC Sans', Arial, sans-serif;
    }

    .show-more button:hover:not(:disabled) {
        background: #003366;
        color: white;
    }

    .show-more button:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }
</style>
