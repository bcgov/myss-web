<script lang="ts">
    import { onMount } from 'svelte';
    import { listIAApplications } from '$lib/api/admin';
    import type { IAApplication } from '$lib/api/admin';
    import { formatDate } from '$lib/utils/format-date';

    let {
        getToken,
    }: {
        getToken: () => string;
    } = $props();

    let applications: IAApplication[] = $state([]);
    let loading = $state(false);
    let error: string | null = $state(null);

    async function fetchApplications() {
        loading = true;
        error = null;
        try {
            const result = await listIAApplications(getToken());
            applications = result.items;
        } catch (e) {
            error = e instanceof Error ? e.message : 'Failed to load IA applications.';
        } finally {
            loading = false;
        }
    }

    onMount(() => {
        fetchApplications();
    });
</script>

<section class="ia-applications">
    <h2>IA Applications</h2>

    {#if loading}
        <p class="loading">Loading applications\u2026</p>
    {:else if error}
        <div class="error" role="alert">
            <p>{error}</p>
            <button onclick={fetchApplications}>Try Again</button>
        </div>
    {:else if applications.length === 0}
        <p class="empty">No IA applications found.</p>
    {:else}
        <table class="apps-table">
            <thead>
                <tr>
                    <th scope="col">Application ID</th>
                    <th scope="col">SR Number</th>
                    <th scope="col">Client</th>
                    <th scope="col">Status</th>
                    <th scope="col">Submitted</th>
                </tr>
            </thead>
            <tbody>
                {#each applications as app (app.application_id)}
                    <tr>
                        <td>{app.application_id}</td>
                        <td>{app.sr_number}</td>
                        <td>{app.client_name}</td>
                        <td>
                            <span class="status-badge status-badge--{app.status.toLowerCase()}">
                                {app.status}
                            </span>
                        </td>
                        <td>{formatDate(app.submitted_at)}</td>
                    </tr>
                {/each}
            </tbody>
        </table>
    {/if}
</section>

<style>
    h2 {
        font-size: 1.2rem;
        color: #003366;
        margin: 0 0 0.75rem 0;
    }

    .ia-applications {
        background: #fff;
        border: 1px solid #d0d7de;
        border-radius: 6px;
        padding: 1.25rem;
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
        padding: 0.75rem 1rem;
        margin-bottom: 1rem;
    }

    .error button {
        margin-top: 0.4rem;
        padding: 0.3rem 0.7rem;
        cursor: pointer;
        border: 1px solid #721c24;
        background: transparent;
        color: #721c24;
        border-radius: 4px;
        font-size: 0.875rem;
    }

    .apps-table {
        width: 100%;
        border-collapse: collapse;
        font-size: 0.95rem;
    }

    .apps-table th,
    .apps-table td {
        padding: 0.6rem 0.75rem;
        text-align: left;
        border-bottom: 1px solid #dee2e6;
    }

    .apps-table th {
        background-color: #f2f2f2;
        font-weight: 700;
        color: #333;
        font-size: 0.875rem;
        text-transform: uppercase;
        letter-spacing: 0.03em;
    }

    .apps-table tbody tr:hover {
        background-color: #f8f9fa;
    }

    .status-badge {
        display: inline-block;
        padding: 0.2rem 0.55rem;
        border-radius: 0.25rem;
        font-size: 0.8rem;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.03em;
        background: #e2e8f0;
        color: #4a5568;
    }

    .status-badge--submitted {
        background-color: #d4edda;
        color: #155724;
    }

    .status-badge--pending {
        background-color: #fff3cd;
        color: #856404;
    }

    .status-badge--approved {
        background-color: #cce5ff;
        color: #004085;
    }

    .status-badge--rejected {
        background-color: #f8d7da;
        color: #721c24;
    }
</style>
