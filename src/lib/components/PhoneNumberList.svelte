<script lang="ts">
    import type { PhoneNumberUpdate } from '$lib/api/account';

    interface EditablePhone {
        phone_id: number | null;
        phone_number: string;
        phone_type: string;
        /** 'existing' = not yet modified, 'add' = brand new row, 'update' = edited, 'delete' = marked for removal */
        state: 'existing' | 'add' | 'update' | 'delete';
    }

    interface InitialPhone {
        phone_id: number;
        phone_number: string;
        phone_type: string;
    }

    let {
        initialPhones,
        disabled = false,
        onchange,
    }: {
        initialPhones: InitialPhone[];
        disabled?: boolean;
        onchange?: (updates: PhoneNumberUpdate[]) => void;
    } = $props();

    let phones = $state<EditablePhone[]>(initialPhones.map((p) => ({
        phone_id: p.phone_id,
        phone_number: p.phone_number,
        phone_type: p.phone_type,
        state: 'existing',
    })));

    let visiblePhones = $derived(phones.filter((p) => p.state !== 'delete'));

    const PHONE_TYPES = ['Cell', 'Home', 'Work', 'Other'];

    function notifyParent() {
        onchange?.(buildPhoneUpdates());
    }

    function addPhone() {
        phones = [
            ...phones,
            { phone_id: null, phone_number: '', phone_type: 'Cell', state: 'add' },
        ];
        notifyParent();
    }

    function markDelete(index: number) {
        const visible = phones.filter((p) => p.state !== 'delete');
        const target = visible[index];
        phones = phones.map((p) => {
            if (p === target) {
                return { ...p, state: 'delete' as const };
            }
            return p;
        });
        notifyParent();
    }

    function onPhoneFieldChange(index: number, field: 'phone_number' | 'phone_type', value: string) {
        const visible = phones.filter((p) => p.state !== 'delete');
        const target = visible[index];
        phones = phones.map((p) => {
            if (p === target) {
                const newState = p.state === 'existing' ? 'update' as const : p.state;
                return { ...p, [field]: value, state: newState };
            }
            return p;
        });
        notifyParent();
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

    /**
     * Reset local state after a successful save — mark all non-deleted phones as 'existing'
     * and drop deleted ones.  Called by the parent via bind:this.
     */
    export function resetAfterSave() {
        phones = phones
            .filter((p) => p.state !== 'delete')
            .map((p) => ({ ...p, state: 'existing' as const }));
    }
</script>

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
                                onPhoneFieldChange(i, 'phone_number', (e.target as HTMLInputElement).value)}
                            disabled={disabled}
                            placeholder="e.g. 250-555-0100"
                        />
                    </div>

                    <div class="field phone-type-field">
                        <label for="phone-type-{i}">Type</label>
                        <select
                            id="phone-type-{i}"
                            value={phone.phone_type}
                            onchange={(e) =>
                                onPhoneFieldChange(i, 'phone_type', (e.target as HTMLSelectElement).value)}
                            disabled={disabled}
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
                        disabled={disabled}
                        aria-label="Remove phone number"
                    >
                        Remove
                    </button>
                </div>
            {/each}
        </div>
    {/if}

    <button type="button" class="btn-add" onclick={addPhone} disabled={disabled}>
        + Add Phone Number
    </button>
</fieldset>

<style>
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
</style>
