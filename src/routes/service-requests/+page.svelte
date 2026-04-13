<script lang="ts">
    import { onMount } from 'svelte';
    import { listServiceRequests } from '$lib/api/service-requests';
    import SRStatusBadge from '$lib/components/SRStatusBadge.svelte';
    import LoadingState from '$lib/components/LoadingState.svelte';
    import type { SRSummary, SRListResponse } from '$lib/api/service-requests';
    import { getToken } from '$lib/utils/auth-token';
    import { formatDate } from '$lib/utils/format-date';

    let items: SRSummary[] = $state([]);
    let total = $state(0);
    let error: string | null = $state(null);
    let loading = $state(true);
    let loadingMore = $state(false);
    let page = $state(1);
    const pageSize = 20;


    async function fetchSRs(currentPage: number) {
        try {
            const data = await listServiceRequests(getToken(), currentPage, pageSize);
            if (currentPage === 1) {
                items = data.items;
            } else {
                items = [...items, ...data.items];
            }
            total = data.total;
        } catch (e) {
            error = e instanceof Error ? e.message : 'Failed to load service requests.';
        }
    }

    onMount(async () => {
        await fetchSRs(page);
        loading = false;
    });

    async function showMore() {
        loadingMore = true;
        page += 1;
        await fetchSRs(page);
        loadingMore = false;
    }

    let hasMore = $derived(items.length < total);
</script>

<svelte:head>
    <title>My Service Requests</title>
</svelte:head>

<main class="sr-list">
    <h1>My Service Requests</h1>

    <LoadingState {loading} {error} empty={items.length === 0} emptyMessage="You have no service requests on file.">
        <p class="summary">
            Showing {items.length} of {total} service request{total !== 1 ? 's' : ''}
        </p>

        <table class="sr-table">
            <thead>
                <tr>
                    <th scope="col">SR Number</th>
                    <th scope="col">Type</th>
                    <th scope="col">Client</th>
                    <th scope="col">Status</th>
                    <th scope="col">Created</th>
                </tr>
            </thead>
            <tbody>
                {#each items as sr (sr.sr_id)}
                    <tr>
                        <td>{sr.sr_number}</td>
                        <td>{sr.sr_type}</td>
                        <td>{sr.client_name}</td>
                        <td><SRStatusBadge status={sr.status} /></td>
                        <td>{formatDate(sr.created_at)}</td>
                    </tr>
                {/each}
            </tbody>
        </table>

        {#if hasMore}
            <div class="show-more">
                <button
                    disabled={loadingMore}
                    onclick={showMore}
                >
                    {loadingMore ? 'Loading...' : 'Show More'}
                </button>
            </div>
        {/if}
    </LoadingState>
</main>

<style>
    .sr-list {
        max-width: 960px;
        margin: 2rem auto;
        padding: 0 1rem;
        font-family: 'BC Sans', Arial, sans-serif;
    }

    h1 {
        font-size: 1.75rem;
        margin-bottom: 1rem;
        color: #003366;
    }

    .summary {
        color: #555;
        margin-bottom: 0.75rem;
        font-size: 0.9rem;
    }

    .sr-table {
        width: 100%;
        border-collapse: collapse;
        font-size: 0.95rem;
    }

    .sr-table th,
    .sr-table td {
        padding: 0.65rem 0.75rem;
        text-align: left;
        border-bottom: 1px solid #dee2e6;
    }

    .sr-table th {
        background-color: #f2f2f2;
        font-weight: 700;
        color: #333;
    }

    .sr-table tbody tr:hover {
        background-color: #f8f9fa;
    }

    .show-more {
        text-align: center;
        margin-top: 1.25rem;
    }

    .show-more button {
        padding: 0.5rem 1.5rem;
        cursor: pointer;
        border: 1px solid #003366;
        background: white;
        color: #003366;
        border-radius: 4px;
        font-size: 0.95rem;
    }

    .show-more button:hover:not(:disabled) {
        background: #003366;
        color: white;
    }

    .show-more button:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }
</style>
