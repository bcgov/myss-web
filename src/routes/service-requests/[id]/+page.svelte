<script lang="ts">
    import { onMount } from 'svelte';
    import { page } from '$app/state';
    import { goto } from '$app/navigation';
    import {
        getServiceRequestDetail,
        withdrawServiceRequest,
        type SRDetailResponse,
    } from '$lib/api/service-requests';
    import SRStatusBadge from '$lib/components/SRStatusBadge.svelte';
    import SRTimeline from '$lib/components/SRTimeline.svelte';
    import LoadingState from '$lib/components/LoadingState.svelte';
    import { formatDate } from '$lib/utils/format-date';
    import { getToken } from '$lib/utils/auth-token';

    let srId = $derived(page.params.id);

    let detail: SRDetailResponse | null = $state(null);
    let loading = $state(true);
    let error: string | null = $state(null);
    let withdrawing = $state(false);
    let withdrawError: string | null = $state(null);

    onMount(async () => {
        try {
            detail = await getServiceRequestDetail(getToken(), srId);
        } catch (e) {
            error = e instanceof Error ? e.message : 'Failed to load service request.';
        } finally {
            loading = false;
        }
    });

    async function handleWithdraw() {
        if (!confirm('Are you sure you want to withdraw this service request? This cannot be undone.')) {
            return;
        }
        withdrawing = true;
        withdrawError = null;
        try {
            await withdrawServiceRequest(getToken(), srId);
            await goto('/service-requests');
        } catch (e) {
            withdrawError = e instanceof Error ? e.message : 'Failed to withdraw service request.';
        } finally {
            withdrawing = false;
        }
    }
</script>

<svelte:head>
    <title>Service Request Detail</title>
</svelte:head>

<main class="sr-detail">
    <nav class="breadcrumb" aria-label="Breadcrumb">
        <a href="/service-requests">My Service Requests</a>
        <span aria-hidden="true"> / </span>
        <span aria-current="page">Detail</span>
    </nav>

    <h1>Service Request Detail</h1>

    <LoadingState {loading} {error} empty={!detail} emptyMessage="Service request not found.">
        <div class="sr-card">
            <div class="sr-header">
                <div>
                    <span class="sr-number">{detail.sr_number}</span>
                    <SRStatusBadge status={detail.status} />
                </div>
                <span class="sr-type-label">{detail.sr_type}</span>
            </div>

            <SRTimeline status={detail.status} />

            <dl class="sr-fields">
                <dt>Client Name</dt>
                <dd>{detail.client_name}</dd>

                <dt>SR ID</dt>
                <dd><code>{detail.sr_id}</code></dd>

                <dt>Created</dt>
                <dd>{formatDate(detail.created_at)}</dd>

                <dt>Status</dt>
                <dd>{detail.status}</dd>
            </dl>

            {#if detail.answers && Object.keys(detail.answers).length > 0}
                <section class="answers-section">
                    <h2>Submitted Answers</h2>
                    <dl class="answers-list">
                        {#each Object.entries(detail.answers) as [key, value] (key)}
                            <dt>{key}</dt>
                            <dd>{value}</dd>
                        {/each}
                    </dl>
                </section>
            {/if}

            {#if detail.attachments && detail.attachments.length > 0}
                <section class="attachments-section">
                    <h2>Attachments</h2>
                    <ul class="attachments-list">
                        {#each detail.attachments as attachment}
                            <li>{attachment}</li>
                        {/each}
                    </ul>
                </section>
            {/if}

            <div class="actions">
                {#if detail.status.toLowerCase() === 'draft'}
                    <a
                        class="btn btn--primary"
                        href="/service-requests/{srId}/form?sr_type={detail.sr_type}"
                    >
                        Continue Form
                    </a>
                    <a
                        class="btn btn--secondary"
                        href="/service-requests/{srId}/submit"
                    >
                        Submit
                    </a>
                {/if}

                {#if !['denied', 'cancelled', 'rejected', 'withdrawn', 'complete'].includes(detail.status.toLowerCase())}
                    <button
                        class="btn btn--danger"
                        disabled={withdrawing}
                        onclick={handleWithdraw}
                    >
                        {withdrawing ? 'Withdrawing...' : 'Withdraw'}
                    </button>
                {/if}
            </div>

            {#if withdrawError}
                <div class="withdraw-error" role="alert">
                    <p>{withdrawError}</p>
                </div>
            {/if}
        </div>
    </LoadingState>
</main>

<style>
    .sr-detail {
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
        margin-bottom: 1.5rem;
    }

    .sr-card {
        background: white;
        border: 1px solid #dee2e6;
        border-radius: 6px;
        padding: 1.5rem;
    }

    .sr-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 1rem;
        flex-wrap: wrap;
        gap: 0.5rem;
    }

    .sr-number {
        font-size: 1.2rem;
        font-weight: 700;
        color: #003366;
        margin-right: 0.75rem;
    }

    .sr-type-label {
        font-size: 0.9rem;
        color: #555;
        background: #f2f2f2;
        padding: 0.2rem 0.5rem;
        border-radius: 4px;
    }

    .sr-fields {
        display: grid;
        grid-template-columns: 1fr 2fr;
        gap: 0.5rem 1rem;
        margin: 1.25rem 0;
        font-size: 0.95rem;
    }

    .sr-fields dt {
        font-weight: 600;
        color: #333;
    }

    .sr-fields dd {
        margin: 0;
        color: #555;
    }

    .sr-fields dd code {
        font-family: monospace;
        background: #f2f2f2;
        padding: 0.1rem 0.35rem;
        border-radius: 3px;
        font-size: 0.85rem;
    }

    .answers-section,
    .attachments-section {
        margin-top: 1.5rem;
        border-top: 1px solid #dee2e6;
        padding-top: 1rem;
    }

    .answers-section h2,
    .attachments-section h2 {
        font-size: 1.1rem;
        color: #003366;
        margin-bottom: 0.75rem;
    }

    .answers-list {
        display: grid;
        grid-template-columns: 1fr 2fr;
        gap: 0.4rem 1rem;
        font-size: 0.9rem;
    }

    .answers-list dt {
        font-weight: 600;
        color: #444;
        text-transform: capitalize;
    }

    .answers-list dd {
        margin: 0;
        color: #555;
    }

    .attachments-list {
        list-style: disc;
        padding-left: 1.5rem;
        font-size: 0.9rem;
        color: #555;
    }

    .actions {
        display: flex;
        gap: 0.75rem;
        margin-top: 1.5rem;
        flex-wrap: wrap;
    }

    .btn {
        display: inline-block;
        padding: 0.5rem 1.25rem;
        border-radius: 4px;
        font-size: 0.95rem;
        font-weight: 600;
        text-decoration: none;
        cursor: pointer;
        border: 2px solid transparent;
        transition: background 0.15s, color 0.15s;
    }

    .btn--primary {
        background: #003366;
        color: white;
    }

    .btn--primary:hover {
        background: #002244;
    }

    .btn--secondary {
        background: white;
        color: #003366;
        border-color: #003366;
    }

    .btn--secondary:hover {
        background: #003366;
        color: white;
    }

    .btn--danger {
        background: white;
        color: #721c24;
        border-color: #dc3545;
    }

    .btn--danger:hover:not(:disabled) {
        background: #dc3545;
        color: white;
    }

    .btn--danger:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }

    .withdraw-error {
        background: #f8d7da;
        color: #721c24;
        border: 1px solid #f5c6cb;
        border-radius: 4px;
        padding: 1rem;
        margin-top: 1rem;
    }
</style>
