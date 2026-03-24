<script lang="ts">
    let {
        messageId,
        disabled = false,
        resetSignal = 0,
        onreply,
    }: {
        messageId: string;
        disabled?: boolean;
        resetSignal?: number;
        onreply?: (body: string) => void;
    } = $props();

    const MAX_CHARS = 4000;
    let body: string = $state('');
    let submitting: boolean = $state(false);

    let remaining = $derived(MAX_CHARS - body.length);
    let canSubmit = $derived(body.trim().length > 0 && !submitting && !disabled);

    // Reset form whenever resetSignal changes (parent increments it to trigger reset)
    $effect(() => {
        // eslint-disable-next-line @typescript-eslint/no-unused-expressions
        resetSignal;
        body = '';
        submitting = false;
    });

    async function handleSubmit() {
        if (!canSubmit) return;
        submitting = true;
        onreply?.(body);
        // Parent is responsible for incrementing resetSignal after handling the reply
    }
</script>

<div class="reply-form">
    <h3 class="form-title">Reply</h3>

    <div class="field">
        <label for="reply-body-{messageId}" class="label">Message</label>
        <textarea
            id="reply-body-{messageId}"
            class="textarea"
            bind:value={body}
            maxlength={MAX_CHARS}
            rows={6}
            placeholder="Type your reply here..."
            disabled={disabled || submitting}
        ></textarea>
        <p
            class="char-counter"
            class:char-counter--warning={remaining <= 200}
            class:char-counter--danger={remaining <= 50}
            aria-live="polite"
        >
            {remaining} character{remaining !== 1 ? 's' : ''} remaining
        </p>
    </div>

    <button
        class="submit-btn"
        disabled={!canSubmit}
        onclick={handleSubmit}
    >
        {submitting ? 'Sending...' : 'Send Reply'}
    </button>
</div>

<style>
    .reply-form {
        border-top: 1px solid #dee2e6;
        padding-top: 1.25rem;
        margin-top: 1.25rem;
        font-family: 'BC Sans', Arial, sans-serif;
    }

    .form-title {
        font-size: 1rem;
        font-weight: 600;
        color: #003366;
        margin: 0 0 0.75rem;
    }

    .field {
        display: flex;
        flex-direction: column;
        gap: 0.35rem;
        margin-bottom: 0.75rem;
    }

    .label {
        font-size: 0.9rem;
        font-weight: 600;
        color: #333;
    }

    .textarea {
        resize: vertical;
        padding: 0.6rem 0.75rem;
        border: 1px solid #aaa;
        border-radius: 4px;
        font-family: 'BC Sans', Arial, sans-serif;
        font-size: 0.95rem;
        line-height: 1.5;
        color: #333;
    }

    .textarea:focus {
        outline: 3px solid #1a5a96;
        outline-offset: 1px;
    }

    .textarea:disabled {
        background: #f5f5f5;
        color: #888;
        cursor: not-allowed;
    }

    .char-counter {
        font-size: 0.8rem;
        color: #666;
        margin: 0;
        text-align: right;
    }

    .char-counter--warning {
        color: #856404;
        font-weight: 600;
    }

    .char-counter--danger {
        color: #721c24;
        font-weight: 700;
    }

    .submit-btn {
        padding: 0.5rem 1.5rem;
        background: #003366;
        color: white;
        border: none;
        border-radius: 4px;
        font-size: 0.95rem;
        font-family: 'BC Sans', Arial, sans-serif;
        font-weight: 600;
        cursor: pointer;
    }

    .submit-btn:hover:not(:disabled) {
        background: #002244;
    }

    .submit-btn:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }
</style>
