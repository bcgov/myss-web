<script lang="ts">
    import { onMount } from 'svelte';
    import { goto } from '$app/navigation';
    import { page } from '$app/state';
    import SupportViewBanner from '$lib/components/SupportViewBanner.svelte';
    import { endTombstone, getClientData } from '$lib/api/admin';

    // The [client] param holds the bceid_guid of the impersonated client
    let clientBceidGuid = $derived(page.params.client ?? '');

    interface ClientProfile {
        first_name: string;
        last_name: string;
        case_number: string | null;
        case_status: string | null;
        email: string | null;
    }

    interface TombstoneInfo {
        client_name: string;
        expires_at: string;
    }

    let clientProfile: ClientProfile | null = $state(null);
    // Load tombstone from sessionStorage immediately so banner persists during loading
    let tombstone: TombstoneInfo | null = $state((() => {
        if (typeof window === 'undefined') return null;
        try {
            const stored = window.sessionStorage.getItem('support_view_tombstone');
            return stored ? JSON.parse(stored) : null;
        } catch {
            return null;
        }
    })());
    let loading = $state(true);
    let error: string | null = $state(null);
    let endingSession = $state(false);

    function getToken(): string {
        if (typeof window === 'undefined') return '';
        return window.sessionStorage.getItem('auth_token') ?? '';
    }

    onMount(async () => {
        try {
            const profile = await getClientData<ClientProfile>(
                getToken(),
                'profile',
                clientBceidGuid,
            );
            clientProfile = profile;
        } catch (e) {
            error = e instanceof Error ? e.message : 'Failed to load client data.';
        } finally {
            loading = false;
        }
    });

    async function handleEndSession() {
        endingSession = true;
        try {
            await endTombstone(getToken(), clientBceidGuid);
        } catch {
            // Best effort — navigate back regardless
        }
        window.sessionStorage.removeItem('support_view_tombstone');
        await goto('/admin/support-view');
    }

    async function handleExpired() {
        // Session expired — navigate back to search
        window.sessionStorage.removeItem('support_view_tombstone');
        await goto('/admin/support-view');
    }
</script>

<svelte:head>
    <title>Support View — Client</title>
</svelte:head>

<div class="client-view">
    {#if tombstone}
        <SupportViewBanner
            clientName={tombstone.client_name}
            expiresAt={tombstone.expires_at}
            onend={handleEndSession}
            onexpired={handleExpired}
        />
    {/if}

    {#if loading}
        <p class="loading">Loading client data…</p>
    {:else if error}
        <div class="error" role="alert">
            <p>{error}</p>
            <button onclick={() => goto('/admin/support-view')}>Return to Search</button>
        </div>
    {:else if clientProfile}
        <div class="client-card">
            <h1 class="client-card__name">
                {clientProfile.first_name} {clientProfile.last_name}
            </h1>

            <dl class="client-card__details">
                <div class="detail-row">
                    <dt>Case Number</dt>
                    <dd>{clientProfile.case_number ?? '—'}</dd>
                </div>
                <div class="detail-row">
                    <dt>Case Status</dt>
                    <dd>{clientProfile.case_status ?? '—'}</dd>
                </div>
                <div class="detail-row">
                    <dt>Email</dt>
                    <dd>{clientProfile.email ?? '—'}</dd>
                </div>
            </dl>
        </div>
    {/if}

    {#if endingSession}
        <p class="loading">Ending support view session…</p>
    {/if}
</div>

<style>
    .client-view {
        max-width: 800px;
        margin: 0 auto;
        font-family: 'BC Sans', Arial, sans-serif;
    }

    .loading {
        color: #555;
        font-style: italic;
    }

    .error {
        background: #f8d7da;
        color: #721c24;
        border: 1px solid #f5c6cb;
        border-radius: 4px;
        padding: 0.75rem 1rem;
    }

    .error button {
        margin-top: 0.5rem;
        padding: 0.35rem 0.75rem;
        cursor: pointer;
        border: 1px solid #721c24;
        background: transparent;
        color: #721c24;
        border-radius: 4px;
    }

    .client-card {
        background: #fff;
        border: 1px solid #d0d7de;
        border-radius: 6px;
        padding: 1.5rem;
    }

    .client-card__name {
        font-size: 1.5rem;
        color: #003366;
        margin: 0 0 1.25rem 0;
    }

    .client-card__details {
        display: grid;
        gap: 0.75rem;
        margin: 0;
    }

    .detail-row {
        display: grid;
        grid-template-columns: 160px 1fr;
        gap: 0.5rem;
        border-bottom: 1px solid #f0f0f0;
        padding-bottom: 0.75rem;
    }

    .detail-row:last-child {
        border-bottom: none;
        padding-bottom: 0;
    }

    dt {
        font-weight: 600;
        color: #555;
        font-size: 0.875rem;
    }

    dd {
        margin: 0;
        color: #212529;
        font-size: 0.95rem;
    }
</style>
