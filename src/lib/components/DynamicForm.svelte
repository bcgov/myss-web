<script lang="ts">
    import type { DynamicFormSchema, DynamicFormField } from '$lib/api/service-requests';

    let {
        schema,
        currentPage = 0,
        saving = false,
        initialAnswers = {},
        onsave,
        onnext,
        onback,
    }: {
        schema: DynamicFormSchema;
        currentPage?: number;
        saving?: boolean;
        initialAnswers?: Record<string, unknown>;
        onsave?: (detail: { answers: Record<string, unknown>; page_index: number }) => void;
        onnext?: (detail: { page_index: number }) => void;
        onback?: (detail: { page_index: number }) => void;
    } = $props();

    // Track field values keyed by field_id — seeded from draft if available
    let answers: Record<string, unknown> = $state({ ...initialAnswers });

    let page = $derived(schema.pages[currentPage] ?? null);
    let isFirst = $derived(currentPage === 0);
    let isLast = $derived(currentPage === schema.total_pages - 1);

    function handleSave() {
        onsave?.({ answers, page_index: currentPage });
    }

    function handleNext() {
        onsave?.({ answers, page_index: currentPage });
        onnext?.({ page_index: currentPage + 1 });
    }

    function handleBack() {
        onsave?.({ answers, page_index: currentPage });
        onback?.({ page_index: currentPage - 1 });
    }

    function getStringValue(field: DynamicFormField): string {
        const v = answers[field.field_id];
        return v !== undefined && v !== null ? String(v) : '';
    }

    function getBooleanValue(field: DynamicFormField): boolean {
        return answers[field.field_id] === true;
    }

    function setFieldValue(field: DynamicFormField, value: unknown) {
        answers = { ...answers, [field.field_id]: value };
    }
</script>

{#if page}
    <section class="dynamic-form-page">
        <h2 class="page-title">{page.title}</h2>

        <div class="page-indicator">
            Page {currentPage + 1} of {schema.total_pages}
        </div>

        <form onsubmit={(e) => { e.preventDefault(); handleSave(); }} novalidate>
            {#each page.fields as field (field.field_id)}
                <div class="form-group">
                    <label for={field.field_id} class:required={field.required}>
                        {field.label}
                        {#if field.required}
                            <span class="required-marker" aria-hidden="true">*</span>
                        {/if}
                    </label>

                    {#if field.field_type === 'textarea'}
                        <textarea
                            id={field.field_id}
                            name={field.field_id}
                            required={field.required}
                            value={getStringValue(field)}
                            oninput={(e) => setFieldValue(field, e.currentTarget.value)}
                            rows={4}
                        ></textarea>

                    {:else if field.field_type === 'select' && field.options}
                        <select
                            id={field.field_id}
                            name={field.field_id}
                            required={field.required}
                            value={getStringValue(field)}
                            onchange={(e) => setFieldValue(field, e.currentTarget.value)}
                        >
                            <option value="">-- Select --</option>
                            {#each field.options as opt}
                                <option value={opt}>{opt}</option>
                            {/each}
                        </select>

                    {:else if field.field_type === 'checkbox'}
                        <div class="checkbox-wrapper">
                            <input
                                type="checkbox"
                                id={field.field_id}
                                name={field.field_id}
                                required={field.required}
                                checked={getBooleanValue(field)}
                                onchange={(e) => setFieldValue(field, e.currentTarget.checked)}
                            />
                        </div>

                    {:else if field.field_type === 'date'}
                        <input
                            type="date"
                            id={field.field_id}
                            name={field.field_id}
                            required={field.required}
                            value={getStringValue(field)}
                            oninput={(e) => setFieldValue(field, e.currentTarget.value)}
                        />

                    {:else if field.field_type === 'number'}
                        <input
                            type="number"
                            id={field.field_id}
                            name={field.field_id}
                            required={field.required}
                            value={getStringValue(field)}
                            oninput={(e) => setFieldValue(field, e.currentTarget.value)}
                        />

                    {:else}
                        <!-- Default: text -->
                        <input
                            type="text"
                            id={field.field_id}
                            name={field.field_id}
                            required={field.required}
                            value={getStringValue(field)}
                            oninput={(e) => setFieldValue(field, e.currentTarget.value)}
                        />
                    {/if}
                </div>
            {/each}

            <div class="form-actions">
                {#if !isFirst}
                    <button type="button" class="btn btn-secondary" onclick={handleBack}>
                        Back
                    </button>
                {/if}

                <button
                    type="button"
                    class="btn btn-outline"
                    onclick={handleSave}
                    disabled={saving}
                >
                    {saving ? 'Saving...' : 'Save Draft'}
                </button>

                {#if !isLast}
                    <button type="button" class="btn btn-primary" onclick={handleNext}>
                        Next
                    </button>
                {:else}
                    <!-- Last page: call onsave only, parent handles submit -->
                    <button type="submit" class="btn btn-primary" disabled={saving}>
                        {saving ? 'Saving...' : 'Review & Submit'}
                    </button>
                {/if}
            </div>
        </form>
    </section>
{:else}
    <p class="no-page">No form page available.</p>
{/if}

<style>
    .dynamic-form-page {
        max-width: 700px;
        margin: 0 auto;
    }

    .page-title {
        font-size: 1.4rem;
        color: #003366;
        margin-bottom: 0.25rem;
    }

    .page-indicator {
        font-size: 0.85rem;
        color: #666;
        margin-bottom: 1.5rem;
    }

    .form-group {
        margin-bottom: 1.25rem;
        display: flex;
        flex-direction: column;
        gap: 0.35rem;
    }

    label {
        font-weight: 600;
        font-size: 0.95rem;
        color: #333;
    }

    .required-marker {
        color: #c0392b;
        margin-left: 0.2rem;
    }

    input[type='text'],
    input[type='number'],
    input[type='date'],
    select,
    textarea {
        width: 100%;
        padding: 0.5rem 0.65rem;
        border: 1px solid #aaa;
        border-radius: 4px;
        font-size: 0.95rem;
        font-family: inherit;
        box-sizing: border-box;
    }

    input:focus,
    select:focus,
    textarea:focus {
        outline: 2px solid #003366;
        outline-offset: 1px;
        border-color: #003366;
    }

    textarea {
        resize: vertical;
        min-height: 100px;
    }

    .checkbox-wrapper {
        display: flex;
        align-items: center;
        gap: 0.5rem;
    }

    .form-actions {
        display: flex;
        gap: 0.75rem;
        margin-top: 2rem;
        flex-wrap: wrap;
    }

    .btn {
        padding: 0.55rem 1.25rem;
        border-radius: 4px;
        font-size: 0.95rem;
        cursor: pointer;
        border: 1px solid transparent;
        font-family: inherit;
    }

    .btn-primary {
        background: #003366;
        color: white;
        border-color: #003366;
    }

    .btn-primary:hover:not(:disabled) {
        background: #002244;
    }

    .btn-secondary {
        background: #6c757d;
        color: white;
        border-color: #6c757d;
    }

    .btn-secondary:hover:not(:disabled) {
        background: #545b62;
    }

    .btn-outline {
        background: white;
        color: #003366;
        border-color: #003366;
    }

    .btn-outline:hover:not(:disabled) {
        background: #e8f0fe;
    }

    .btn:disabled {
        opacity: 0.55;
        cursor: not-allowed;
    }

    .no-page {
        color: #666;
        font-style: italic;
    }
</style>
