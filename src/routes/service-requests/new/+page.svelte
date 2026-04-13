<script lang="ts">
    import { onMount } from 'svelte';
    import { goto } from '$app/navigation';
    import {
        getEligibleTypes,
        createServiceRequest,
        type SRTypeMetadata,
        type SRType,
    } from '$lib/api/service-requests';
    import LoadingState from '$lib/components/LoadingState.svelte';
    import { getToken } from '$lib/utils/auth-token';

    let eligibleTypes: SRTypeMetadata[] = $state([]);
    let selectedType: SRType | '' = $state('');
    let loading = $state(true);
    let submitting = $state(false);
    let error: string | null = $state(null);

    // For demo/dev purposes we use a fixed case status; real implementation
    // would derive this from user session/profile.
    const caseStatus = 'ACTIVE';


    onMount(async () => {
        try {
            eligibleTypes = await getEligibleTypes(getToken(), caseStatus);
        } catch (e) {
            error = e instanceof Error ? e.message : 'Failed to load eligible service request types.';
        } finally {
            loading = false;
        }
    });

    async function handleContinue() {
        if (!selectedType) return;
        submitting = true;
        error = null;
        try {
            const draft = await createServiceRequest(getToken(), {
                sr_type: selectedType as SRType,
            });
            await goto(`/service-requests/${draft.sr_id}/form`);
        } catch (e) {
            error = e instanceof Error ? e.message : 'Failed to create service request.';
            submitting = false;
        }
    }

    function formatSRType(srType: string): string {
        return srType
            .toLowerCase()
            .replace(/_/g, ' ')
            .replace(/\b\w/g, (c) => c.toUpperCase());
    }
</script>

<svelte:head>
    <title>New Service Request</title>
</svelte:head>

<main class="new-sr-page">
    <nav class="breadcrumb" aria-label="Breadcrumb">
        <a href="/service-requests">My Service Requests</a>
        <span aria-hidden="true"> / </span>
        <span aria-current="page">New Request</span>
    </nav>

    <h1>Start a New Service Request</h1>
    <p class="intro">Select the type of service request you would like to submit.</p>

    <LoadingState {loading} {error} empty={eligibleTypes.length === 0} emptyMessage="No service request types are currently available for your case.">
        <form onsubmit={(e) => { e.preventDefault(); handleContinue(); }}>
            <fieldset>
                <legend class="sr-only">Choose a service request type</legend>

                <div class="type-list" role="radiogroup" aria-label="Service request types">
                    {#each eligibleTypes as meta (meta.sr_type)}
                        <label
                            class="type-option"
                            class:selected={selectedType === meta.sr_type}
                        >
                            <input
                                type="radio"
                                name="sr_type"
                                value={meta.sr_type}
                                bind:group={selectedType}
                                aria-describedby={`desc-${meta.sr_type}`}
                            />
                            <div class="type-details">
                                <span class="type-name">{meta.display_name || formatSRType(meta.sr_type)}</span>
                                <span class="type-meta" id={`desc-${meta.sr_type}`}>
                                    {#if meta.requires_pin}
                                        <span class="badge">Requires PIN</span>
                                    {/if}
                                    {#if meta.has_attachments}
                                        <span class="badge">Attachments</span>
                                    {/if}
                                </span>
                            </div>
                        </label>
                    {/each}
                </div>
            </fieldset>

            <div class="form-actions">
                <a href="/service-requests" class="btn btn-secondary">Cancel</a>
                <button
                    type="submit"
                    class="btn btn-primary"
                    disabled={!selectedType || submitting}
                >
                    {submitting ? 'Creating...' : 'Continue'}
                </button>
            </div>

            {#if error}
                <div class="error submit-error" role="alert">
                    <p>{error}</p>
                </div>
            {/if}
        </form>
    </LoadingState>
</main>

<style>
    .new-sr-page {
        max-width: 700px;
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
        margin-bottom: 0.5rem;
    }

    .intro {
        color: #555;
        margin-bottom: 1.5rem;
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

    fieldset {
        border: none;
        padding: 0;
        margin: 0 0 1.5rem;
    }

    .type-list {
        display: flex;
        flex-direction: column;
        gap: 0.65rem;
    }

    .type-option {
        display: flex;
        align-items: flex-start;
        gap: 0.75rem;
        padding: 0.85rem 1rem;
        border: 2px solid #dee2e6;
        border-radius: 6px;
        cursor: pointer;
        transition: border-color 0.15s, background 0.15s;
    }

    .type-option:hover {
        border-color: #003366;
        background: #f0f4f8;
    }

    .type-option.selected {
        border-color: #003366;
        background: #e8f0fe;
    }

    .type-option input[type='radio'] {
        margin-top: 0.15rem;
        flex-shrink: 0;
        accent-color: #003366;
    }

    .type-details {
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
    }

    .type-name {
        font-weight: 600;
        color: #222;
        font-size: 1rem;
    }

    .type-meta {
        display: flex;
        gap: 0.4rem;
        flex-wrap: wrap;
    }

    .badge {
        font-size: 0.75rem;
        background: #e2e8f0;
        color: #444;
        border-radius: 3px;
        padding: 0.1rem 0.45rem;
    }

    .form-actions {
        display: flex;
        gap: 0.75rem;
        margin-top: 1.5rem;
    }

    .btn {
        padding: 0.55rem 1.4rem;
        border-radius: 4px;
        font-size: 0.95rem;
        cursor: pointer;
        border: 1px solid transparent;
        font-family: inherit;
        text-decoration: none;
        display: inline-flex;
        align-items: center;
    }

    .btn-primary {
        background: #003366;
        color: white;
        border-color: #003366;
    }

    .btn-primary:hover:not(:disabled) {
        background: #002244;
    }

    .btn-primary:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }

    .btn-secondary {
        background: white;
        color: #003366;
        border-color: #003366;
    }

    .btn-secondary:hover {
        background: #f0f4f8;
    }

    .submit-error {
        margin-top: 1rem;
    }

    .sr-only {
        position: absolute;
        width: 1px;
        height: 1px;
        padding: 0;
        margin: -1px;
        overflow: hidden;
        clip: rect(0, 0, 0, 0);
        white-space: nowrap;
        border: 0;
    }
</style>
