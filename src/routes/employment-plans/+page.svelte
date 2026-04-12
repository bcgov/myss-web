<script lang="ts">
    import { onMount } from 'svelte';
    import { goto } from '$app/navigation';
    import { listPlans, type EmploymentPlan } from '$lib/api/employment-plans';
    import EPStatusBadge from '$lib/components/EPStatusBadge.svelte';
    import { formatDate } from '$lib/utils/format-date';
    import { getToken } from '$lib/utils/auth-token';

    let plans: EmploymentPlan[] = $state([]);
    let loading = $state(true);
    let error: string | null = $state(null);


    async function fetchPlans() {
        const token = getToken();
        try {
            const data = await listPlans(token);
            plans = data.plans;
        } catch (e) {
            const msg = e instanceof Error ? e.message : 'Failed to load employment plans.';
            if (msg.includes('(403)')) {
                window.location.href = '/error?reason=case-not-active';
                return;
            }
            error = msg;
        }
    }

    onMount(async () => {
        try {
            await fetchPlans();
        } catch (e) {
            error = e instanceof Error ? e.message : 'Failed to load employment plans.';
        } finally {
            loading = false;
        }
    });

    async function handleRetry() {
        error = null;
        loading = true;
        plans = [];
        try {
            await fetchPlans();
        } catch (e) {
            error = e instanceof Error ? e.message : 'Failed to load employment plans.';
        } finally {
            loading = false;
        }
    }

    function handleRowClick(epId: number) {
        goto(`/employment-plans/${epId}`);
    }

    function handleRowKeydown(event: KeyboardEvent, epId: number) {
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            goto(`/employment-plans/${epId}`);
        }
    }
</script>

<svelte:head>
    <title>Employment Plans</title>
</svelte:head>

<main class="ep-list-page">
    <h1>Employment Plans</h1>

    {#if loading}
        <p class="loading" aria-live="polite">Loading employment plans...</p>
    {:else if error}
        <div class="error" role="alert">
            <p>{error}</p>
            <button onclick={handleRetry}>Try again</button>
        </div>
    {:else if plans.length === 0}
        <p class="empty">No employment plans found.</p>
    {:else}
        <table class="ep-table">
            <thead>
                <tr>
                    <th scope="col">Plan Date</th>
                    <th scope="col">Status</th>
                    <th scope="col">Plan ID</th>
                </tr>
            </thead>
            <tbody>
                {#each plans as plan (plan.ep_id)}
                    <tr
                        class="ep-row"
                        tabindex="0"
                        role="button"
                        aria-label="View employment plan {plan.ep_id}"
                        onclick={() => handleRowClick(plan.ep_id)}
                        onkeydown={(e) => handleRowKeydown(e, plan.ep_id)}
                    >
                        <td>{formatDate(plan.plan_date)}</td>
                        <td><EPStatusBadge status={plan.status} /></td>
                        <td class="ep-id">{plan.ep_id}</td>
                    </tr>
                {/each}
            </tbody>
        </table>
    {/if}
</main>

<style>
    .ep-list-page {
        max-width: 860px;
        margin: 2rem auto;
        padding: 0 1rem;
        font-family: 'BC Sans', Arial, sans-serif;
    }

    h1 {
        font-size: 1.75rem;
        color: #003366;
        margin-bottom: 1.25rem;
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

    .error p {
        margin: 0 0 0.5rem;
    }

    .error button {
        padding: 0.4rem 0.8rem;
        cursor: pointer;
        background: white;
        border: 1px solid #721c24;
        border-radius: 4px;
        color: #721c24;
        font-size: 0.9rem;
        font-family: inherit;
    }

    .error button:hover {
        background: #721c24;
        color: white;
    }

    .ep-table {
        width: 100%;
        border-collapse: collapse;
        font-size: 0.95rem;
    }

    .ep-table th {
        text-align: left;
        padding: 0.65rem 1rem;
        background: #003366;
        color: #fff;
        font-weight: 600;
        font-size: 0.875rem;
        letter-spacing: 0.02em;
    }

    .ep-table th:first-child {
        border-radius: 4px 0 0 0;
    }

    .ep-table th:last-child {
        border-radius: 0 4px 0 0;
    }

    .ep-table td {
        padding: 0.75rem 1rem;
        border-bottom: 1px solid #e0e0e0;
        color: #222;
        vertical-align: middle;
    }

    .ep-row {
        cursor: pointer;
        transition: background 0.1s ease;
    }

    .ep-row:hover {
        background: #f0f4f8;
    }

    .ep-row:focus {
        outline: 2px solid #FCBA19;
        outline-offset: -2px;
        background: #f0f4f8;
    }

    .ep-id {
        font-family: monospace;
        color: #555;
        font-size: 0.875rem;
    }
</style>
