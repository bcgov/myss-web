<script lang="ts">
    import { onMount } from 'svelte';
    import { page } from '$app/state';
    import { getPlanDetail, type EPDetailResponse } from '$lib/api/employment-plans';
    import EPStatusBadge from '$lib/components/EPStatusBadge.svelte';
    import EPSignModal from '$lib/components/EPSignModal.svelte';
    import LoadingState from '$lib/components/LoadingState.svelte';
    import { formatDate } from '$lib/utils/format-date';
    import { getToken } from '$lib/utils/auth-token';

    let epId = $derived(Number(page.params.id));

    let plan: EPDetailResponse | null = $state(null);
    let loading = $state(true);
    let error: string | null = $state(null);
    let showSignModal = $state(false);

    async function loadPlan() {
        loading = true;
        error = null;
        try {
            plan = await getPlanDetail(getToken(), epId);
        } catch (e) {
            const msg = e instanceof Error ? e.message : 'Failed to load employment plan.';
            if (msg.includes('(403)')) {
                window.location.href = '/error?reason=case-not-active';
                return;
            }
            error = msg;
        } finally {
            loading = false;
        }
    }

    onMount(async () => {
        await loadPlan();
    });

    function handleSignClick() {
        showSignModal = true;
    }

    function handleSigned(detail: { ep_id: number; signed_at: string }) {
        showSignModal = false;
        // Only update if it was a real sign (not a cancel/close with empty signed_at)
        if (detail.signed_at && plan) {
            plan = { ...plan, status: 'Submitted' };
        }
    }

    let canSign = $derived(
        plan !== null &&
        plan.status === 'PendingSignature' &&
        Boolean(plan.icm_attachment_id),
    );
</script>

<svelte:head>
    <title>Employment Plan {epId}</title>
</svelte:head>

{#if showSignModal && plan && plan.message_id !== null}
    <EPSignModal
        {epId}
        messageId={plan.message_id}
        token={getToken()}
        onsigned={handleSigned}
    />
{/if}

<main class="ep-detail-page">
    <nav class="breadcrumb" aria-label="Breadcrumb">
        <a href="/employment-plans">Employment Plans</a>
        <span aria-hidden="true"> / </span>
        <span aria-current="page">Plan {epId}</span>
    </nav>

    <h1>Employment Plan</h1>

    <LoadingState {loading} {error} empty={!plan} emptyMessage="Employment plan not found.">
        <div class="plan-card">
            <dl class="plan-details">
                <dt>Plan ID</dt>
                <dd><code>{plan.ep_id}</code></dd>

                <dt>Plan Date</dt>
                <dd>{formatDate(plan.plan_date)}</dd>

                <dt>Status</dt>
                <dd><EPStatusBadge status={plan.status} /></dd>

                <dt>Attachment ID</dt>
                <dd>
                    {#if plan.icm_attachment_id}
                        <code>{plan.icm_attachment_id}</code>
                    {:else}
                        <span class="not-available">Not available</span>
                    {/if}
                </dd>

                {#if plan.message_id !== null}
                    <dt>Message ID</dt>
                    <dd><code>{plan.message_id}</code></dd>
                {/if}
            </dl>

            {#if plan.message_deleted}
                <div class="info-banner" role="note">
                    The associated message for this plan has been deleted.
                </div>
            {/if}

            {#if canSign}
                <div class="sign-section">
                    <p>This employment plan requires your signature. Please review the plan and click below to sign.</p>
                    <button class="btn-sign" onclick={handleSignClick}>
                        Sign Employment Plan
                    </button>
                </div>
            {/if}

            {#if plan.status === 'Submitted'}
                <div class="success-banner" role="status">
                    This employment plan has been signed and submitted.
                </div>
            {/if}
        </div>
    </LoadingState>
</main>

<style>
    .ep-detail-page {
        max-width: 720px;
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
        margin-bottom: 1.25rem;
    }

    .plan-card {
        background: #fff;
        border: 1px solid #d0d8e4;
        border-radius: 6px;
        padding: 1.5rem;
        display: flex;
        flex-direction: column;
        gap: 1.25rem;
    }

    .plan-details {
        display: grid;
        grid-template-columns: max-content 1fr;
        gap: 0.5rem 1.5rem;
        margin: 0;
        font-size: 0.95rem;
    }

    .plan-details dt {
        color: #555;
        font-weight: 600;
    }

    .plan-details dd {
        margin: 0;
        color: #222;
    }

    .plan-details code {
        font-family: monospace;
        background: #f2f2f2;
        padding: 0.1rem 0.35rem;
        border-radius: 3px;
        font-size: 0.875rem;
    }

    .not-available {
        color: #888;
        font-style: italic;
    }

    .info-banner {
        background: #e8f4fd;
        color: #1a5276;
        border: 1px solid #aed6f1;
        border-radius: 4px;
        padding: 0.75rem 1rem;
        font-size: 0.9rem;
    }

    .sign-section {
        border-top: 1px solid #e0e0e0;
        padding-top: 1.25rem;
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
    }

    .sign-section p {
        margin: 0;
        color: #444;
        font-size: 0.95rem;
        line-height: 1.5;
    }

    .btn-sign {
        align-self: flex-start;
        padding: 0.6rem 1.5rem;
        background: #FCBA19;
        color: #000;
        border: 2px solid #FCBA19;
        border-radius: 4px;
        font-size: 0.95rem;
        font-family: inherit;
        font-weight: 700;
        cursor: pointer;
        transition: background 0.15s ease;
    }

    .btn-sign:hover {
        background: #e9a908;
        border-color: #e9a908;
    }

    .success-banner {
        background: #d4edda;
        color: #155724;
        border: 1px solid #c3e6cb;
        border-radius: 4px;
        padding: 0.75rem 1rem;
        font-size: 0.95rem;
        font-weight: 600;
    }
</style>
