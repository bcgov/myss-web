<script lang="ts">
    import { signPlan, type EPSignResponse } from '$lib/api/employment-plans';

    let {
        epId,
        messageId,
        token,
        onsigned,
    }: {
        epId: number;
        messageId: number;
        token: string;
        onsigned?: (detail: EPSignResponse) => void;
    } = $props();

    let pin: string = $state('');
    let submitting: boolean = $state(false);
    let error: string | null = $state(null);

    async function handleSubmit() {
        if (!pin.trim()) {
            error = 'Please enter your PIN.';
            return;
        }
        submitting = true;
        error = null;
        try {
            const result = await signPlan(token, epId, { pin, message_id: messageId });
            onsigned?.(result);
        } catch (e) {
            const msg = e instanceof Error ? e.message : 'Failed to sign employment plan.';
            // Show inline error without closing — including 403 (invalid PIN)
            error = msg.includes('(403)')
                ? 'Incorrect PIN. Please try again.'
                : msg;
        } finally {
            submitting = false;
        }
    }

    function handleClose() {
        // Reset state and notify parent by dispatching a cancel event
        pin = '';
        error = null;
        onsigned?.({ ep_id: epId, signed_at: '' } as EPSignResponse);
    }

    function handleKeydown(event: KeyboardEvent) {
        if (event.key === 'Escape') {
            handleClose();
        }
    }
</script>

<svelte:window onkeydown={handleKeydown} />

<!-- Backdrop -->
<div class="modal-backdrop" role="presentation" onclick={handleClose}></div>

<!-- Modal dialog -->
<div
    class="modal"
    role="dialog"
    aria-modal="true"
    aria-labelledby="modal-title"
>
    <div class="modal-header">
        <h2 id="modal-title">Sign Employment Plan</h2>
        <button class="close-btn" onclick={handleClose} aria-label="Close">&#x2715;</button>
    </div>

    <div class="modal-body">
        <p>Enter your PIN to sign this employment plan. Your signature confirms you have reviewed and agreed to the plan.</p>

        {#if error}
            <div class="error" role="alert">
                {error}
            </div>
        {/if}

        <label for="pin-input" class="pin-label">PIN</label>
        <input
            id="pin-input"
            type="password"
            class="pin-input"
            bind:value={pin}
            disabled={submitting}
            autocomplete="off"
            placeholder="Enter your PIN"
        />
    </div>

    <div class="modal-footer">
        <button class="btn-secondary" onclick={handleClose} disabled={submitting}>
            Cancel
        </button>
        <button class="btn-primary" onclick={handleSubmit} disabled={submitting || !pin.trim()}>
            {submitting ? 'Signing…' : 'Sign Plan'}
        </button>
    </div>
</div>

<style>
    .modal-backdrop {
        position: fixed;
        inset: 0;
        background: rgba(0, 0, 0, 0.5);
        z-index: 100;
    }

    .modal {
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        z-index: 101;
        background: #fff;
        border-radius: 6px;
        box-shadow: 0 4px 24px rgba(0, 0, 0, 0.2);
        width: min(480px, 90vw);
        display: flex;
        flex-direction: column;
        font-family: 'BC Sans', Arial, sans-serif;
    }

    .modal-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 1.25rem 1.5rem 1rem;
        border-bottom: 1px solid #e0e0e0;
    }

    .modal-header h2 {
        font-size: 1.2rem;
        color: #003366;
        margin: 0;
        font-weight: 700;
    }

    .close-btn {
        background: none;
        border: none;
        font-size: 1.2rem;
        cursor: pointer;
        color: #555;
        padding: 0.25rem 0.5rem;
        line-height: 1;
        border-radius: 3px;
    }

    .close-btn:hover {
        background: #f0f0f0;
        color: #222;
    }

    .modal-body {
        padding: 1.25rem 1.5rem;
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
    }

    .modal-body p {
        margin: 0;
        color: #444;
        font-size: 0.95rem;
        line-height: 1.5;
    }

    .error {
        background: #f8d7da;
        color: #721c24;
        border: 1px solid #f5c6cb;
        border-radius: 4px;
        padding: 0.65rem 0.9rem;
        font-size: 0.9rem;
    }

    .pin-label {
        font-weight: 600;
        font-size: 0.95rem;
        color: #222;
    }

    .pin-input {
        padding: 0.5rem 0.75rem;
        border: 1px solid #aaa;
        border-radius: 4px;
        font-size: 1rem;
        font-family: inherit;
        width: 100%;
        box-sizing: border-box;
    }

    .pin-input:focus {
        outline: 2px solid #003366;
        outline-offset: 1px;
        border-color: #003366;
    }

    .pin-input:disabled {
        background: #f5f5f5;
        color: #888;
    }

    .modal-footer {
        display: flex;
        justify-content: flex-end;
        gap: 0.75rem;
        padding: 1rem 1.5rem 1.25rem;
        border-top: 1px solid #e0e0e0;
    }

    .btn-primary,
    .btn-secondary {
        padding: 0.5rem 1.25rem;
        border-radius: 4px;
        font-size: 0.95rem;
        font-family: inherit;
        font-weight: 600;
        cursor: pointer;
    }

    .btn-primary {
        background: #003366;
        color: #fff;
        border: 2px solid #003366;
    }

    .btn-primary:hover:not(:disabled) {
        background: #002244;
        border-color: #002244;
    }

    .btn-primary:disabled {
        opacity: 0.55;
        cursor: not-allowed;
    }

    .btn-secondary {
        background: #fff;
        color: #003366;
        border: 2px solid #003366;
    }

    .btn-secondary:hover:not(:disabled) {
        background: #f0f4f8;
    }

    .btn-secondary:disabled {
        opacity: 0.55;
        cursor: not-allowed;
    }
</style>
