<script lang="ts">
    import { onMount } from 'svelte';
    import { getProfile, getCaseMembers, type AccountInfoResponse, type CaseMember } from '$lib/api/account';
    import ContactEditForm from '$lib/components/ContactEditForm.svelte';
    import PINChangeForm from '$lib/components/PINChangeForm.svelte';
    import CaseMemberList from '$lib/components/CaseMemberList.svelte';
    import LoadingState from '$lib/components/LoadingState.svelte';
    import { getToken } from '$lib/utils/auth-token';

    let profile: AccountInfoResponse | null = $state(null);
    let members: CaseMember[] = $state([]);

    let loading = $state(true);
    let error: string | null = $state(null);
    let token = $state('');


    async function fetchAll() {
        token = getToken();

        const [profileResult, membersResult] = await Promise.allSettled([
            getProfile(token),
            getCaseMembers(token),
        ]);

        // 403 on profile → redirect
        if (profileResult.status === 'rejected') {
            const msg = profileResult.reason instanceof Error ? profileResult.reason.message : '';
            if (msg.includes('(403)')) {
                window.location.href = '/error?reason=case-not-active';
                return;
            }
            error = msg || 'Failed to load account information.';
            return;
        }

        profile = profileResult.value;

        if (membersResult.status === 'fulfilled') {
            members = membersResult.value.members;
        }
        // Non-fatal if case members fail — leave as empty array
    }

    onMount(async () => {
        try {
            await fetchAll();
        } catch (e) {
            error = e instanceof Error ? e.message : 'Failed to load account information.';
        } finally {
            loading = false;
        }
    });

    async function handleRetry() {
        error = null;
        loading = true;
        profile = null;
        members = [];
        try {
            await fetchAll();
        } catch (e) {
            error = e instanceof Error ? e.message : 'Failed to load account information.';
        } finally {
            loading = false;
        }
    }
</script>

<svelte:head>
    <title>My Account</title>
</svelte:head>

<main class="account-page">
    <h1>My Account</h1>

    <LoadingState {loading} {error} empty={!profile} emptyMessage="No account information available.">
        <!-- Case summary banner -->
        <div class="case-banner">
            <dl class="case-grid">
                {#if profile?.case_number}
                    <dt>Case Number</dt>
                    <dd>{profile.case_number}</dd>
                {/if}
                {#if profile?.case_status}
                    <dt>Case Status</dt>
                    <dd>{profile.case_status}</dd>
                {/if}
            </dl>
        </div>

        <!-- Three panels -->
        <div class="panels">
            <ContactEditForm {profile} {token} />
            <PINChangeForm {token} />
            <CaseMemberList {members} />
        </div>
    </LoadingState>
</main>

<style>
    .account-page {
        max-width: 800px;
        margin: 2rem auto;
        padding: 0 1rem;
        font-family: 'BC Sans', Arial, sans-serif;
    }

    h1 {
        font-size: 1.75rem;
        color: #003366;
        margin-bottom: 1.25rem;
    }

    .case-banner {
        background: #f0f4f8;
        border: 1px solid #c6d4e3;
        border-radius: 6px;
        padding: 1rem 1.5rem;
        margin-bottom: 1.5rem;
    }

    .case-grid {
        display: grid;
        grid-template-columns: max-content 1fr;
        gap: 0.3rem 1.25rem;
        margin: 0;
        font-size: 0.95rem;
    }

    .case-grid dt {
        color: #555;
        font-weight: 600;
    }

    .case-grid dd {
        margin: 0;
        color: #222;
    }

    .panels {
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
    }
</style>
