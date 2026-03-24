<script lang="ts">
    import { onMount } from 'svelte';
    import { page } from '$app/state';
    import { goto } from '$app/navigation';
    import { getAnswers, saveAnswers } from '$lib/api/monthly-reports';
    import DynamicForm from '$lib/components/DynamicForm.svelte';
    import type { DynamicFormSchema } from '$lib/api/service-requests';

    let sd81Id = $derived(page.params.id);

    let answersData: Record<string, unknown> | null = $state(null);
    let schema: DynamicFormSchema | null = $state(null);
    let initialAnswers: Record<string, unknown> = $state({});
    let currentFormPage = $state(0);
    let loading = $state(true);
    let saving = $state(false);
    let saveSuccess = $state(false);
    let error: string | null = $state(null);

    function getToken(): string {
        return (typeof window !== 'undefined' && window.sessionStorage.getItem('auth_token')) ?? '';
    }

    onMount(async () => {
        await loadData();
    });

    async function loadData() {
        loading = true;
        error = null;
        try {
            answersData = await getAnswers(getToken(), sd81Id);
            initialAnswers = answersData ?? {};

            // Build a simple single-page schema from the saved answers,
            // or use a placeholder schema if no answers yet.
            // In a real integration the schema would come from a dedicated endpoint.
            schema = buildSchema();
        } catch (e) {
            error = e instanceof Error ? e.message : 'Failed to load monthly report form.';
        } finally {
            loading = false;
        }
    }

    function buildSchema(): DynamicFormSchema {
        return {
            form_type: 'MONTHLY_REPORT',
            pages: [
                {
                    page_index: 0,
                    title: 'Monthly Report — Income & Circumstances',
                    fields: [
                        {
                            field_id: 'employment_income',
                            label: 'Did you have any employment income this month?',
                            field_type: 'select',
                            required: true,
                            options: ['No', 'Yes'],
                        },
                        {
                            field_id: 'employment_income_amount',
                            label: 'If yes, total amount ($)',
                            field_type: 'number',
                            required: false,
                        },
                        {
                            field_id: 'other_income',
                            label: 'Did you receive any other income or benefits?',
                            field_type: 'select',
                            required: true,
                            options: ['No', 'Yes'],
                        },
                        {
                            field_id: 'other_income_description',
                            label: 'If yes, describe the source and amount',
                            field_type: 'textarea',
                            required: false,
                        },
                        {
                            field_id: 'address_changed',
                            label: 'Has your address changed this month?',
                            field_type: 'select',
                            required: true,
                            options: ['No', 'Yes'],
                        },
                        {
                            field_id: 'household_changed',
                            label: 'Has anyone moved in or out of your household?',
                            field_type: 'select',
                            required: true,
                            options: ['No', 'Yes'],
                        },
                        {
                            field_id: 'additional_info',
                            label: 'Any additional information you would like to provide?',
                            field_type: 'textarea',
                            required: false,
                        },
                    ],
                },
            ],
            total_pages: 1,
        };
    }

    async function handleSave(detail: { answers: Record<string, unknown>; page_index: number }) {
        saving = true;
        saveSuccess = false;
        error = null;
        try {
            await saveAnswers(getToken(), sd81Id, detail.answers);
            saveSuccess = true;
            setTimeout(() => {
                saveSuccess = false;
            }, 3000);
        } catch (e) {
            error = e instanceof Error ? e.message : 'Failed to save answers.';
        } finally {
            saving = false;
        }
    }

    async function handleNext(detail: { page_index: number }) {
        if (schema && detail.page_index < schema.total_pages) {
            currentFormPage = detail.page_index;
        } else {
            // Last page — navigate to submit
            await goto(`/monthly-report/${sd81Id}/submit`);
        }
    }

    function handleBack(detail: { page_index: number }) {
        if (detail.page_index >= 0) {
            currentFormPage = detail.page_index;
        }
    }
</script>

<svelte:head>
    <title>Monthly Report Form</title>
</svelte:head>

<main class="form-page">
    <nav class="breadcrumb" aria-label="Breadcrumb">
        <a href="/monthly-report">Monthly Report</a>
        <span aria-hidden="true"> / </span>
        <span aria-current="page">Form</span>
    </nav>

    <h1>Monthly Report</h1>
    <p class="report-id-label">Report ID: <code>{sd81Id}</code></p>

    {#if loading}
        <p class="loading" aria-live="polite">Loading form...</p>
    {:else if error}
        <div class="error" role="alert">
            <p>{error}</p>
            <button onclick={loadData}>Try again</button>
        </div>
    {:else if schema}
        {#if saveSuccess}
            <div class="save-success" role="status" aria-live="polite">
                Progress saved successfully.
            </div>
        {/if}

        <DynamicForm
            {schema}
            currentPage={currentFormPage}
            {saving}
            {initialAnswers}
            onsave={handleSave}
            onnext={handleNext}
            onback={handleBack}
        />
    {:else}
        <p class="empty">No form found for this report.</p>
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

    .report-id-label {
        font-size: 0.85rem;
        color: #666;
        margin-bottom: 1.5rem;
    }

    .report-id-label code {
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
