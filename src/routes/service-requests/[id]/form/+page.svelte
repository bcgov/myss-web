<script lang="ts">
    import { onMount } from 'svelte';
    import { page } from '$app/state';
    import { goto } from '$app/navigation';
    import {
        getFormSchema,
        getDraft,
        updateFormDraft,
        type DynamicFormSchema,
        type SRType,
    } from '$lib/api/service-requests';
    import DynamicForm from '$lib/components/DynamicForm.svelte';

    let srId = $derived(page.params.id);

    let schema: DynamicFormSchema | null = $state(null);
    let initialAnswers: Record<string, unknown> = $state({});
    let currentPage = $state(0);
    let loading = $state(true);
    let saving = $state(false);
    let error: string | null = $state(null);
    let saveSuccess = $state(false);

    function getToken(): string {
        return (typeof window !== 'undefined' && window.sessionStorage.getItem('auth_token')) ?? '';
    }

    // sr_type is passed as a query param (e.g., /service-requests/SR-001/form?sr_type=ASSIST)
    let srType = $derived((page.url.searchParams.get('sr_type') ?? 'ASSIST') as SRType);

    onMount(async () => {
        await loadSchemaAndDraft();
    });

    async function loadSchemaAndDraft() {
        loading = true;
        error = null;
        try {
            // Load schema and draft in parallel
            const [schemaResult, draftResult] = await Promise.allSettled([
                getFormSchema(getToken(), srId, srType),
                getDraft(getToken(), srId),
            ]);

            if (schemaResult.status === 'fulfilled') {
                schema = schemaResult.value;
            } else {
                throw new Error('Failed to load form schema.');
            }

            // Re-hydrate answers from saved draft if available
            if (draftResult.status === 'fulfilled' && draftResult.value.draft_json) {
                const draftData = draftResult.value.draft_json as { answers?: Record<string, unknown>; page_index?: number };
                initialAnswers = draftData.answers ?? {};
                currentPage = draftData.page_index ?? 0;
            }
        } catch (e) {
            error = e instanceof Error ? e.message : 'Failed to load form.';
        } finally {
            loading = false;
        }
    }

    async function handleSave(detail: { answers: Record<string, unknown>; page_index: number }) {
        saving = true;
        saveSuccess = false;
        error = null;
        try {
            await updateFormDraft(getToken(), srId, {
                answers: detail.answers,
                page_index: detail.page_index,
            });
            saveSuccess = true;
            // Clear success indicator after 3 seconds
            setTimeout(() => { saveSuccess = false; }, 3000);
        } catch (e) {
            error = e instanceof Error ? e.message : 'Failed to save draft.';
        } finally {
            saving = false;
        }
    }

    async function handleNext(detail: { page_index: number }) {
        if (schema && detail.page_index < schema.total_pages) {
            currentPage = detail.page_index;
        }
    }

    function handleBack(detail: { page_index: number }) {
        if (detail.page_index >= 0) {
            currentPage = detail.page_index;
        }
    }
</script>

<svelte:head>
    <title>Service Request Form</title>
</svelte:head>

<main class="form-page">
    <nav class="breadcrumb" aria-label="Breadcrumb">
        <a href="/service-requests">My Service Requests</a>
        <span aria-hidden="true"> / </span>
        <span aria-current="page">Form</span>
    </nav>

    <h1>Service Request Form</h1>
    <p class="sr-id-label">SR ID: <code>{srId}</code></p>

    {#if loading}
        <p class="loading" aria-live="polite">Loading form...</p>
    {:else if error}
        <div class="error" role="alert">
            <p>{error}</p>
            <button onclick={loadSchemaAndDraft}>Try again</button>
        </div>
    {:else if schema}
        {#if saveSuccess}
            <div class="save-success" role="status" aria-live="polite">
                Draft saved successfully.
            </div>
        {/if}

        <DynamicForm
            {schema}
            {currentPage}
            {saving}
            {initialAnswers}
            onsave={handleSave}
            onnext={handleNext}
            onback={handleBack}
        />
    {:else}
        <p class="empty">No form found for this service request.</p>
    {/if}
</main>

<style>
    .form-page {
        max-width: 800px;
        margin: 2rem auto;
        padding: 0 1rem;
        font-family: 'BC Sans', Arial, sans-serif;
    }

    .breadcrumb {
        font-size: 0.9rem;
        color: #555;
        margin-bottom: 1rem;
    }

    .breadcrumb a {
        color: #1a5276;
        text-decoration: underline;
    }

    h1 {
        font-size: 1.75rem;
        color: #003366;
        margin-bottom: 0.25rem;
    }

    .sr-id-label {
        font-size: 0.85rem;
        color: #666;
        margin-bottom: 1.5rem;
    }

    .sr-id-label code {
        font-family: monospace;
        background: #f2f2f2;
        padding: 0.1rem 0.35rem;
        border-radius: 3px;
    }

    .loading,
    .empty {
        color: #555;
        font-style: italic;
    }

    .error {
        background: #f8d7da;
        color: #721c24;
        border: 1px solid #f5c6cb;
        border-radius: 4px;
        padding: 1rem;
        margin-bottom: 1rem;
    }

    .error button {
        margin-top: 0.5rem;
        padding: 0.4rem 0.8rem;
        cursor: pointer;
    }

    .save-success {
        background: #d4edda;
        color: #155724;
        border: 1px solid #c3e6cb;
        border-radius: 4px;
        padding: 0.75rem 1rem;
        margin-bottom: 1.25rem;
        font-size: 0.95rem;
    }
</style>
