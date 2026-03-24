<script lang="ts">
    import { updateContact, type AccountInfoResponse, type PhoneNumberUpdate } from '$lib/api/account';

    let { profile, token }: { profile: AccountInfoResponse; token: string } = $props();

    // Local editable state — initialised from profile
    let email = $state(profile.email ?? '');
    let emailConfirm = $state('');

    interface EditablePhone {
        phone_id: number | null;
        phone_number: string;
        phone_type: string;
        /** 'existing' = not yet modified, 'add' = brand new row, 'update' = edited, 'delete' = marked for removal */
        state: 'existing' | 'add' | 'update' | 'delete';
    }

    let phones = $state<EditablePhone[]>(profile.phone_numbers.map((p) => ({
        phone_id: p.phone_id,
        phone_number: p.phone_number,
        phone_type: p.phone_type,
        state: 'existing',
    })));

    let submitting = $state(false);
    let error = $state<string | null>(null);
    let success = $state<string | null>(null);

    let emailMismatch = $derived(emailConfirm.length > 0 && email !== emailConfirm);

    let visiblePhones = $derived(phones.filter((p) => p.state !== 'delete'));

    let formValid = $derived(!emailMismatch);

    function addPhone() {
        phones = [
            ...phones,
            { phone_id: null, phone_number: '', phone_type: 'Cell', state: 'add' },
        ];
    }

    function markDelete(index: number) {
        // index is into visiblePhones — find the actual phone in phones array
        const visible = phones.filter((p) => p.state !== 'delete');
        const target = visible[index];
        phones = phones.map((p) => {
            if (p === target) {
                if (p.state === 'add') {
                    // New unsaved row — just remove entirely
                    return { ...p, state: 'delete' };
                }
                return { ...p, state: 'delete' };
            }
            return p;
        });
    }

    function onPhoneChange(index: number, field: 'phone_number' | 'phone_type', value: string) {
        const visible = phones.filter((p) => p.state !== 'delete');
        const target = visible[index];
        phones = phones.map((p) => {
            if (p === target) {
                const newState = p.state === 'existing' ? 'update' : p.state;
                return { ...p, [field]: value, state: newState };
            }
            return p;
        });
    }

    function buildPhoneUpdates(): PhoneNumberUpdate[] {
        return phones
            .filter((p) => p.state !== 'existing')
            .map((p) => {
                let operation: PhoneNumberUpdate['operation'];
                if (p.state === 'add') operation = 'ADD';
                else if (p.state === 'update') operation = 'UPDATE';
                else operation = 'DELETE';

                return {
                    phone_id: p.phone_id,
                    phone_number: p.phone_number,
                    phone_type: p.phone_type,
                    operation,
                };
            });
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
                phones: buildPhoneUpdates(),
            });
            success = 'Contact information updated successfully.';
            // Sync local state — mark all non-deleted as existing
            phones = phones
                .filter((p) => p.state !== 'delete')
                .map((p) => ({ ...p, state: 'existing' }));
            emailConfirm = '';
        } catch (e) {
            const msg = e instanceof Error ? e.message : 'Failed to update contact information.';
            error = msg;
        } finally {
            submitting = false;
        }
    }

    const PHONE_TYPES = ['Cell', 'Home', 'Work', 'Other'];
</script>

<section class="contact-edit-form">
    <h2>Contact Information</h2>

    {#if error}
        <div class="alert alert-error" role="alert">{error}</div>
    {/if}

    {#if success}
        <div class="alert alert-success" role="status">{success}</div>
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
        <fieldset class="field-group">
            <legend>Phone Numbers</legend>

            {#if visiblePhones.length === 0}
                <p class="empty">No phone numbers on file.</p>
            {:else}
                <div class="phone-list">
                    {#each visiblePhones as phone, i}
                        <div class="phone-row">
                            <div class="field phone-number-field">
                                <label for="phone-number-{i}">Number</label>
                                <input
                                    id="phone-number-{i}"
                                    type="tel"
                                    value={phone.phone_number}
                                    oninput={(e) =>
                                        onPhoneChange(i, 'phone_number', (e.target as HTMLInputElement).value)}
                                    disabled={submitting}
                                    placeholder="e.g. 250-555-0100"
                                />
                            </div>

                            <div class="field phone-type-field">
                                <label for="phone-type-{i}">Type</label>
                                <select
                                    id="phone-type-{i}"
                                    value={phone.phone_type}
                                    onchange={(e) =>
                                        onPhoneChange(i, 'phone_type', (e.target as HTMLSelectElement).value)}
                                    disabled={submitting}
                                >
                                    {#each PHONE_TYPES as pt}
                                        <option value={pt} selected={phone.phone_type === pt}>{pt}</option>
                                    {/each}
                                </select>
                            </div>

                            <button
                                type="button"
                                class="btn-delete"
                                onclick={() => markDelete(i)}
                                disabled={submitting}
                                aria-label="Remove phone number"
                            >
                                Remove
                            </button>
                        </div>
                    {/each}
                </div>
            {/if}

            <button type="button" class="btn-add" onclick={addPhone} disabled={submitting}>
                + Add Phone Number
            </button>
        </fieldset>

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

    .alert {
        padding: 0.75rem 1rem;
        border-radius: 4px;
        font-size: 0.9rem;
        margin-bottom: 1rem;
    }

    .alert-error {
        background: #f8d7da;
        color: #721c24;
        border: 1px solid #f5c6cb;
    }

    .alert-success {
        background: #d4edda;
        color: #155724;
        border: 1px solid #c3e6cb;
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

    input[type='email'],
    input[type='tel'] {
        padding: 0.5rem 0.75rem;
        border: 1px solid #aaa;
        border-radius: 4px;
        font-size: 0.95rem;
        font-family: inherit;
        width: 100%;
        max-width: 360px;
        box-sizing: border-box;
    }

    input:focus,
    select:focus {
        outline: 2px solid #003366;
        outline-offset: 1px;
        border-color: #003366;
    }

    input:disabled,
    select:disabled {
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

    .empty {
        color: #555;
        font-style: italic;
        margin: 0 0 0.5rem;
        font-size: 0.9rem;
    }

    .phone-list {
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
        margin-bottom: 0.75rem;
    }

    .phone-row {
        display: flex;
        align-items: flex-end;
        gap: 0.75rem;
        flex-wrap: wrap;
    }

    .phone-number-field {
        flex: 2;
        min-width: 160px;
    }

    .phone-type-field {
        flex: 1;
        min-width: 110px;
    }

    select {
        padding: 0.5rem 0.5rem;
        border: 1px solid #aaa;
        border-radius: 4px;
        font-size: 0.95rem;
        font-family: inherit;
        width: 100%;
        box-sizing: border-box;
        background: #fff;
    }

    .btn-delete {
        padding: 0.45rem 0.85rem;
        background: #fff;
        color: #c0392b;
        border: 1px solid #c0392b;
        border-radius: 4px;
        font-size: 0.875rem;
        font-family: inherit;
        cursor: pointer;
        white-space: nowrap;
        align-self: flex-end;
    }

    .btn-delete:hover:not(:disabled) {
        background: #fdf2f2;
    }

    .btn-delete:disabled {
        opacity: 0.55;
        cursor: not-allowed;
    }

    .btn-add {
        padding: 0.4rem 0.85rem;
        background: #fff;
        color: #003366;
        border: 1px dashed #003366;
        border-radius: 4px;
        font-size: 0.875rem;
        font-family: inherit;
        cursor: pointer;
        width: fit-content;
    }

    .btn-add:hover:not(:disabled) {
        background: #f0f4f8;
    }

    .btn-add:disabled {
        opacity: 0.55;
        cursor: not-allowed;
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
