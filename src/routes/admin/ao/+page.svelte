<script lang="ts">
    import type { AOLoginResponse } from '$lib/api/admin';
    import { getToken } from '$lib/utils/auth-token';
    import AOLoginForm from '$lib/components/AOLoginForm.svelte';
    import IAApplicationList from '$lib/components/IAApplicationList.svelte';

    let aoSession: AOLoginResponse | null = $state(null);

    function handleReset() {
        aoSession = null;
    }
</script>

<svelte:head>
    <title>AO Registration — Admin</title>
</svelte:head>

<div class="ao-page">
    <h1>Admin Override (AO) Registration</h1>

    {#if !aoSession}
        <AOLoginForm {getToken} onlogin={(result) => aoSession = result} />
    {:else}
        <div class="ao-workflow">
            <div class="ao-workflow__header">
                <div class="ao-workflow__client-info">
                    <span class="ao-workflow__label">AO Session active for:</span>
                    <strong class="ao-workflow__client-name">{aoSession.client_name}</strong>
                    <span class="ao-workflow__sr">SR: {aoSession.sr_number}</span>
                </div>
                <button class="btn-secondary" type="button" onclick={handleReset}>
                    End AO Session
                </button>
            </div>

            <IAApplicationList {getToken} />
        </div>
    {/if}
</div>

<style>
    .ao-page {
        max-width: 960px;
        margin: 0 auto;
        font-family: 'BC Sans', Arial, sans-serif;
    }

    h1 {
        font-size: 1.75rem;
        color: #003366;
        margin: 0 0 1.5rem 0;
    }

    .ao-workflow {
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
    }

    .ao-workflow__header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 1rem;
        background: #e8f0fe;
        border: 1px solid #b0c4e8;
        border-radius: 6px;
        padding: 1rem 1.25rem;
    }

    .ao-workflow__client-info {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        flex-wrap: wrap;
    }

    .ao-workflow__label {
        font-size: 0.875rem;
        color: #555;
    }

    .ao-workflow__client-name {
        font-size: 1rem;
        font-weight: 700;
        color: #003366;
    }

    .ao-workflow__sr {
        font-size: 0.875rem;
        color: #555;
        font-style: italic;
    }

    .btn-secondary {
        padding: 0.4rem 1rem;
        background: transparent;
        color: #003366;
        border: 1px solid #003366;
        border-radius: 4px;
        font-size: 0.9rem;
        font-weight: 600;
        cursor: pointer;
        transition: background-color 0.15s, color 0.15s;
    }

    .btn-secondary:hover {
        background: #003366;
        color: #fff;
    }
</style>
