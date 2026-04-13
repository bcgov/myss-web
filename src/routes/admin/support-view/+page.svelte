<script lang="ts">
    import { goto } from '$app/navigation';
    import AdminClientSearch from '$lib/components/AdminClientSearch.svelte';
    import { searchClients, createTombstone } from '$lib/api/admin';
    import type { ClientSearchResult } from '$lib/api/admin';
    import { getToken } from '$lib/utils/auth-token';

    const PAGE_SIZE = 10;

    let items: ClientSearchResult[] = $state([]);
    let total = $state(0);
    let currentPage = $state(1);
    let searchParams = $state({ first_name: '', last_name: '', sin: '' });
    let searching = $state(false);
    let loadingMore = $state(false);
    let viewingClient: string | null = $state(null);
    let error: string | null = $state(null);
    let hasSearched = $state(false);


    async function doSearch(params: { first_name: string; last_name: string; sin: string }, page: number) {
        try {
            const result = await searchClients(getToken(), {
                first_name: params.first_name || undefined,
                last_name: params.last_name || undefined,
                sin: params.sin || undefined,
                page,
            });
            return result;
        } catch (e) {
            throw e instanceof Error ? e : new Error('Search failed.');
        }
    }

    async function handleSearch(detail: { first_name: string; last_name: string; sin: string; page: number }) {
        const { first_name, last_name, sin } = detail;
        searchParams = { first_name, last_name, sin };
        currentPage = 1;
        searching = true;
        error = null;
        hasSearched = true;
        try {
            const result = await doSearch(searchParams, 1);
            items = result.items;
            total = result.total;
        } catch (e) {
            error = e instanceof Error ? e.message : 'Search failed.';
        } finally {
            searching = false;
        }
    }

    async function showMore() {
        loadingMore = true;
        error = null;
        try {
            const nextPage = currentPage + 1;
            const result = await doSearch(searchParams, nextPage);
            items = [...items, ...result.items];
            total = result.total;
            currentPage = nextPage;
        } catch (e) {
            error = e instanceof Error ? e.message : 'Failed to load more results.';
        } finally {
            loadingMore = false;
        }
    }

    async function viewClient(bceidGuid: string) {
        viewingClient = bceidGuid;
        error = null;
        try {
            const tombstone = await createTombstone(getToken(), bceidGuid);
            // Store tombstone data so the client view banner renders immediately
            const client = items.find((c) => c.bceid_guid === bceidGuid);
            window.sessionStorage.setItem(
                'support_view_tombstone',
                JSON.stringify({
                    client_name: client ? `${client.first_name} ${client.last_name}` : bceidGuid,
                    expires_at: tombstone.expires_at,
                }),
            );
            await goto(`/admin/support-view/${encodeURIComponent(bceidGuid)}`);
        } catch (e) {
            error = e instanceof Error ? e.message : 'Failed to start support view session.';
        } finally {
            viewingClient = null;
        }
    }

    let hasMore = $derived(items.length < total);
</script>

<svelte:head>
    <title>Support View — Client Search</title>
</svelte:head>

<div class="support-view-search">
    <h1>Support View — Client Search</h1>

    <AdminClientSearch loading={searching} onsearch={handleSearch} />

    {#if error}
        <div class="error" role="alert">
            <p>{error}</p>
        </div>
    {/if}

    {#if searching}
        <p class="loading">Searching…</p>
    {:else if hasSearched}
        {#if items.length === 0}
            <p class="empty">No clients found matching your search criteria.</p>
        {:else}
            <p class="summary">
                Showing {items.length} of {total} result{total !== 1 ? 's' : ''}
            </p>

            <table class="results-table">
                <thead>
                    <tr>
                        <th scope="col">Name</th>
                        <th scope="col">SIN</th>
                        <th scope="col">Case Number</th>
                        <th scope="col">Action</th>
                    </tr>
                </thead>
                <tbody>
                    {#each items as client (client.bceid_guid)}
                        <tr>
                            <td>{client.first_name} {client.last_name}</td>
                            <td>{client.sin_masked}</td>
                            <td>{client.case_number ?? '—'}</td>
                            <td>
                                <button
                                    class="btn-view"
                                    disabled={viewingClient === client.bceid_guid}
                                    onclick={() => viewClient(client.bceid_guid)}
                                >
                                    {viewingClient === client.bceid_guid ? 'Starting…' : 'View Client'}
                                </button>
                            </td>
                        </tr>
                    {/each}
                </tbody>
            </table>

            {#if hasMore}
                <div class="show-more">
                    <button
                        class="btn-more"
                        disabled={loadingMore}
                        onclick={showMore}
                    >
                        {loadingMore ? 'Loading…' : 'Show More'}
                    </button>
                </div>
            {/if}
        {/if}
    {/if}
</div>

<style>
    .support-view-search {
        max-width: 960px;
        margin: 0 auto;
        font-family: 'BC Sans', Arial, sans-serif;
    }

    h1 {
        font-size: 1.75rem;
        color: #003366;
        margin: 0 0 1.25rem 0;
    }

    .error {
        background: #f8d7da;
        color: #721c24;
        border: 1px solid #f5c6cb;
        border-radius: 4px;
        padding: 0.75rem 1rem;
        margin-bottom: 1rem;
    }

    .loading,
    .empty {
        color: #555;
        font-style: italic;
    }

    .summary {
        font-size: 0.9rem;
        color: #555;
        margin-bottom: 0.75rem;
    }

    .results-table {
        width: 100%;
        border-collapse: collapse;
        font-size: 0.95rem;
        background: #fff;
        border-radius: 6px;
        overflow: hidden;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
    }

    .results-table th,
    .results-table td {
        padding: 0.65rem 0.9rem;
        text-align: left;
        border-bottom: 1px solid #dee2e6;
    }

    .results-table th {
        background-color: #f2f2f2;
        font-weight: 700;
        color: #333;
        font-size: 0.875rem;
        text-transform: uppercase;
        letter-spacing: 0.03em;
    }

    .results-table tbody tr:hover {
        background-color: #f8f9fa;
    }

    .btn-view {
        padding: 0.3rem 0.8rem;
        background: #003366;
        color: #fff;
        border: none;
        border-radius: 4px;
        font-size: 0.875rem;
        font-weight: 600;
        cursor: pointer;
        transition: background-color 0.15s;
    }

    .btn-view:hover:not(:disabled) {
        background: #002244;
    }

    .btn-view:disabled {
        opacity: 0.6;
        cursor: not-allowed;
    }

    .show-more {
        text-align: center;
        margin-top: 1.25rem;
    }

    .btn-more {
        padding: 0.5rem 1.5rem;
        border: 1px solid #003366;
        background: #fff;
        color: #003366;
        border-radius: 4px;
        font-size: 0.95rem;
        font-weight: 600;
        cursor: pointer;
        transition: background-color 0.15s, color 0.15s;
    }

    .btn-more:hover:not(:disabled) {
        background: #003366;
        color: #fff;
    }

    .btn-more:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }
</style>
