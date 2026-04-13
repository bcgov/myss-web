<script lang="ts">
    import { changePin } from '$lib/api/account';
    import Alert from '$lib/components/Alert.svelte';

    let { token }: { token: string } = $props();

    let currentPin = $state('');
    let newPin = $state('');
    let confirmPin = $state('');

    let submitting = $state(false);
    let error = $state<string | null>(null);
    let success = $state<string | null>(null);

    let pinMismatch = $derived(newPin.length > 0 && confirmPin.length > 0 && newPin !== confirmPin);
    let formValid = $derived(
        currentPin.length === 4 &&
        newPin.length === 4 &&
        confirmPin.length === 4 &&
        newPin === confirmPin
    );

    function handleInput(event: Event) {
        const input = event.target as HTMLInputElement;
        // Keep only digits, max 4
        input.value = input.value.replace(/\D/g, '').slice(0, 4);
    }

    async function handleSubmit() {
        if (!formValid) return;

        submitting = true;
        error = null;
        success = null;

        try {
            await changePin(token, { current_pin: currentPin, new_pin: newPin });
            success = 'PIN changed successfully.';
            currentPin = '';
            newPin = '';
            confirmPin = '';
        } catch (e) {
            const msg = e instanceof Error ? e.message : 'Failed to change PIN.';
            if (msg.includes('(403)')) {
                error = 'Incorrect current PIN. Please try again.';
            } else {
                error = msg;
            }
        } finally {
            submitting = false;
        }
    }
</script>

<section class="pin-change-form">
    <h2>Change PIN</h2>

    {#if error}
        <Alert variant="error">{error}</Alert>
    {/if}

    {#if success}
        <Alert variant="success">{success}</Alert>
    {/if}

    <form onsubmit={(e) => { e.preventDefault(); handleSubmit(); }} novalidate>
        <div class="field">
            <label for="current-pin">Current PIN</label>
            <input
                id="current-pin"
                type="password"
                inputmode="numeric"
                maxlength="4"
                autocomplete="current-password"
                bind:value={currentPin}
                oninput={handleInput}
                disabled={submitting}
                placeholder="4-digit PIN"
            />
        </div>

        <div class="field">
            <label for="new-pin">New PIN</label>
            <input
                id="new-pin"
                type="password"
                inputmode="numeric"
                maxlength="4"
                autocomplete="new-password"
                bind:value={newPin}
                oninput={handleInput}
                disabled={submitting}
                placeholder="4-digit PIN"
            />
        </div>

        <div class="field">
            <label for="confirm-pin">Confirm New PIN</label>
            <input
                id="confirm-pin"
                type="password"
                inputmode="numeric"
                maxlength="4"
                autocomplete="new-password"
                bind:value={confirmPin}
                oninput={handleInput}
                disabled={submitting}
                placeholder="4-digit PIN"
                class:input-error={pinMismatch}
            />
            {#if pinMismatch}
                <p class="field-error" role="alert">New PIN and confirmation do not match.</p>
            {/if}
        </div>

        <div class="actions">
            <button type="submit" class="btn-primary" disabled={submitting || !formValid}>
                {submitting ? 'Changing PIN…' : 'Change PIN'}
            </button>
        </div>
    </form>
</section>

<style>
    .pin-change-form {
        background: #fff;
        border: 1px solid #c6d4e3;
        border-radius: 6px;
        padding: 1.5rem;
    }

    h2 {
        font-size: 1.15rem;
        color: #003366;
        margin: 0 0 1rem;
        font-weight: 700;
    }

    form {
        display: flex;
        flex-direction: column;
        gap: 1rem;
    }

    .field {
        display: flex;
        flex-direction: column;
        gap: 0.35rem;
    }

    label {
        font-weight: 600;
        font-size: 0.9rem;
        color: #222;
    }

    input[type='password'] {
        padding: 0.5rem 0.75rem;
        border: 1px solid #aaa;
        border-radius: 4px;
        font-size: 1rem;
        font-family: inherit;
        width: 100%;
        max-width: 200px;
        box-sizing: border-box;
        letter-spacing: 0.2em;
    }

    input[type='password']:focus {
        outline: 2px solid #003366;
        outline-offset: 1px;
        border-color: #003366;
    }

    input[type='password']:disabled {
        background: #f5f5f5;
        color: #888;
    }

    .input-error {
        border-color: #dc3545 !important;
    }

    .field-error {
        color: #dc3545;
        font-size: 0.85rem;
        margin: 0;
    }

    .actions {
        margin-top: 0.5rem;
    }

    .btn-primary {
        padding: 0.5rem 1.25rem;
        background: #003366;
        color: #fff;
        border: 2px solid #003366;
        border-radius: 4px;
        font-size: 0.95rem;
        font-family: inherit;
        font-weight: 600;
        cursor: pointer;
    }

    .btn-primary:hover:not(:disabled) {
        background: #002244;
        border-color: #002244;
    }

    .btn-primary:disabled {
        opacity: 0.55;
        cursor: not-allowed;
    }
</style>
