<script lang="ts">
    import { onMount } from 'svelte';
    import { aoLogin, listIAApplications } from '$lib/api/admin';
    import type { AOLoginResponse, IAApplication } from '$lib/api/admin';
    import { formatDate } from '$lib/utils/format-date';
    import { getToken } from '$lib/utils/auth-token';

    // ---- AO Login form state ----
    let srNumber = $state('');
    let sin = $state('');
    let loginLoading = $state(false);
    let loginError: string | null = $state(null);

    // ---- Post-login state ----
    let loginResult: AOLoginResponse | null = $state(null);
    let applications: IAApplication[] = $state([]);
    let appsLoading = $state(false);
    let appsError: string | null = $state(null);


    async function handleLogin(event: SubmitEvent) {
        event.preventDefault();
        loginLoading = true;
        loginError = null;
        try {
            loginResult = await aoLogin(getToken(), srNumber, sin);
            await fetchApplications();
        } catch (e) {
            loginError = e instanceof Error ? e.message : 'AO login failed. Please check your SR number and SIN.';
        } finally {
            loginLoading = false;
        }
    }

    async function fetchApplications() {
        appsLoading = true;
        appsError = null;
        try {
            const result = await listIAApplications(getToken());
            applications = result.items;
        } catch (e) {
            appsError = e instanceof Error ? e.message : 'Failed to load IA applications.';
        } finally {
            appsLoading = false;
        }
    }

    function handleReset() {
        loginResult = null;
        applications = [];
        srNumber = '';
        sin = '';
        loginError = null;
        appsError = null;
    }

</script>

<svelte:head>
    <title>AO Registration — Admin</title>
</svelte:head>

<div class="ao-page">
    <h1>Admin Override (AO) Registration</h1>

    {#if !loginResult}
        <!-- AO Login Form -->
        <div class="ao-login-card">
            <h2>AO Login</h2>
            <p class="ao-login-card__desc">
                Enter the client's Service Request number and Social Insurance Number to begin
                the AO registration workflow.
            </p>

            <form onsubmit={handleLogin} novalidate>
                <div class="field">
                    <label for="ao-sr-number">Service Request Number</label>
                    <input
                        id="ao-sr-number"
                        type="text"
                        bind:value={srNumber}
                        placeholder="e.g. SR-2024-00001"
                        required
                        autocomplete="off"
                    />
                </div>

                <div class="field">
                    <label for="ao-sin">Social Insurance Number</label>
                    <input
                        id="ao-sin"
                        type="text"
                        bind:value={sin}
                        placeholder="e.g. 123-456-789"
                        required
                        maxlength="11"
                        autocomplete="off"
                    />
                </div>

                {#if loginError}
                    <div class="error" role="alert">
                        <p>{loginError}</p>
                    </div>
                {/if}

                <div class="form-actions">
                    <button type="submit" class="btn-primary" disabled={loginLoading}>
                        {loginLoading ? 'Logging in…' : 'AO Login'}
                    </button>
                </div>
            </form>
        </div>
    {:else}
        <!-- AO Registration Workflow -->
        <div class="ao-workflow">
            <div class="ao-workflow__header">
                <div class="ao-workflow__client-info">
                    <span class="ao-workflow__label">AO Session active for:</span>
                    <strong class="ao-workflow__client-name">{loginResult.client_name}</strong>
                    <span class="ao-workflow__sr">SR: {loginResult.sr_number}</span>
                </div>
                <button class="btn-secondary" type="button" onclick={handleReset}>
                    End AO Session
                </button>
            </div>

            <section class="ia-applications">
                <h2>IA Applications</h2>

                {#if appsLoading}
                    <p class="loading">Loading applications…</p>
                {:else if appsError}
                    <div class="error" role="alert">
                        <p>{appsError}</p>
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

    h2 {
        font-size: 1.2rem;
        color: #003366;
        margin: 0 0 0.75rem 0;
    }

    /* AO Login Card */
    .ao-login-card {
        background: #fff;
        border: 1px solid #d0d7de;
        border-radius: 6px;
        padding: 1.5rem;
        max-width: 480px;
    }

    .ao-login-card__desc {
        color: #555;
        font-size: 0.95rem;
        margin: 0 0 1.25rem 0;
        line-height: 1.5;
    }

    .field {
        display: flex;
        flex-direction: column;
        gap: 0.3rem;
        margin-bottom: 1rem;
    }

    .field label {
        font-size: 0.875rem;
        font-weight: 600;
        color: #333;
    }

    .field input {
        padding: 0.45rem 0.7rem;
        border: 1px solid #ced4da;
        border-radius: 4px;
        font-size: 0.95rem;
        font-family: inherit;
        color: #212529;
        transition: border-color 0.15s;
    }

    .field input:focus {
        outline: none;
        border-color: #1a5a96;
        box-shadow: 0 0 0 2px rgba(26, 90, 150, 0.2);
    }

    .form-actions {
        margin-top: 1.25rem;
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

    .btn-primary {
        padding: 0.5rem 1.5rem;
        background: #003366;
        color: #fff;
        border: none;
        border-radius: 4px;
        font-size: 0.95rem;
        font-weight: 600;
        cursor: pointer;
        transition: background-color 0.15s;
    }

    .btn-primary:hover:not(:disabled) {
        background: #002244;
    }

    .btn-primary:disabled {
        opacity: 0.6;
        cursor: not-allowed;
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

    /* AO Workflow */
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

    /* IA Applications table */
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
