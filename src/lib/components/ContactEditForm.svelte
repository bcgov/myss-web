<script lang="ts">
    import { updateContact, type AccountInfoResponse, type PhoneNumberUpdate } from '$lib/api/account';
    import Alert from '$lib/components/Alert.svelte';
    import PhoneNumberList from '$lib/components/PhoneNumberList.svelte';

    let { profile, token }: { profile: AccountInfoResponse; token: string } = $props();

    // Local editable state — initialised from profile
    let email = $state(profile.email ?? '');
    let emailConfirm = $state('');

    let phoneUpdates = $state<PhoneNumberUpdate[]>([]);
    let phoneListRef: PhoneNumberList | undefined = $state();

    let submitting = $state(false);
    let error = $state<string | null>(null);
    let success = $state<string | null>(null);

    let emailMismatch = $derived(emailConfirm.length > 0 && email !== emailConfirm);

    let formValid = $derived(!emailMismatch);

    function handlePhoneChange(updates: PhoneNumberUpdate[]) {
        phoneUpdates = updates;
    }

    async function handleSubmit() {
        if (!formValid) return;

        submitting = true;
        error = null;
        success = null;

        try {
            await updateContact(token, {
                email: email || null,
                email_confirm: emailConfirm || null,
                phones: phoneUpdates,
            });
            success = 'Contact information updated successfully.';
            phoneListRef?.resetAfterSave();
            phoneUpdates = [];
            emailConfirm = '';
        } catch (e) {
            const msg = e instanceof Error ? e.message : 'Failed to update contact information.';
            error = msg;
        } finally {
            submitting = false;
        }
    }
</script>

<section class="contact-edit-form">
    <h2>Contact Information</h2>

    {#if error}
        <Alert variant="error">{error}</Alert>
    {/if}

    {#if success}
        <Alert variant="success">{success}</Alert>
    {/if}

    <form onsubmit={(e) => { e.preventDefault(); handleSubmit(); }} novalidate>
        <!-- Email -->
        <fieldset class="field-group">
            <legend>Email Address</legend>

            <div class="field">
                <label for="email">Email</label>
                <input
                    id="email"
                    type="email"
                    bind:value={email}
                    disabled={submitting}
                    autocomplete="email"
                    placeholder="email@example.com"
                />
            </div>

            <div class="field">
                <label for="email-confirm">Confirm Email</label>
                <input
                    id="email-confirm"
                    type="email"
                    bind:value={emailConfirm}
                    disabled={submitting}
                    autocomplete="off"
                    placeholder="Re-enter email"
                    class:input-error={emailMismatch}
                />
                {#if emailMismatch}
                    <p class="field-error" role="alert">Email addresses do not match.</p>
                {/if}
            </div>
        </fieldset>

        <!-- Phone Numbers -->
        <PhoneNumberList
            bind:this={phoneListRef}
            initialPhones={profile.phone_numbers}
            disabled={submitting}
            onchange={handlePhoneChange}
        />

        <div class="actions">
            <button type="submit" class="btn-primary" disabled={submitting || !formValid}>
                {submitting ? 'Saving…' : 'Save Changes'}
            </button>
        </div>
    </form>
</section>

<style>
    .contact-edit-form {
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
        gap: 1.5rem;
    }

    fieldset {
        border: 1px solid #dde6ef;
        border-radius: 5px;
        padding: 1rem 1.25rem;
        margin: 0;
    }

    legend {
        font-weight: 700;
        font-size: 0.9rem;
        color: #003366;
        padding: 0 0.4rem;
    }

    .field-group {
        display: flex;
        flex-direction: column;
        gap: 0.85rem;
    }

    .field {
        display: flex;
        flex-direction: column;
        gap: 0.3rem;
    }

    label {
        font-weight: 600;
        font-size: 0.875rem;
        color: #222;
    }

    input[type='email'] {
        padding: 0.5rem 0.75rem;
        border: 1px solid #aaa;
        border-radius: 4px;
        font-size: 0.95rem;
        font-family: inherit;
        width: 100%;
        max-width: 360px;
        box-sizing: border-box;
    }

    input:focus {
        outline: 2px solid #003366;
        outline-offset: 1px;
        border-color: #003366;
    }

    input:disabled {
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
        display: flex;
        justify-content: flex-start;
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
