<script lang="ts">
    import { aoLogin } from '$lib/api/admin';
    import type { AOLoginResponse } from '$lib/api/admin';

    let {
        getToken,
        onlogin,
    }: {
        getToken: () => string;
        onlogin: (result: AOLoginResponse) => void;
    } = $props();

    let srNumber = $state('');
    let sin = $state('');
    let loading = $state(false);
    let error: string | null = $state(null);

    async function handleSubmit(event: SubmitEvent) {
        event.preventDefault();
        loading = true;
        error = null;
        try {
            const result = await aoLogin(getToken(), srNumber, sin);
            onlogin(result);
        } catch (e) {
            error = e instanceof Error ? e.message : 'AO login failed. Please check your SR number and SIN.';
        } finally {
            loading = false;
        }
    }
</script>

<div class="ao-login-card">
    <h2>AO Login</h2>
    <p class="ao-login-card__desc">
        Enter the client's Service Request number and Social Insurance Number to begin
        the AO registration workflow.
    </p>

    <form onsubmit={handleSubmit} novalidate>
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

        {#if error}
            <div class="error" role="alert">
                <p>{error}</p>
            </div>
        {/if}

        <div class="form-actions">
            <button type="submit" class="btn-primary" disabled={loading}>
                {loading ? 'Logging in\u2026' : 'AO Login'}
            </button>
        </div>
    </form>
</div>

<style>
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

    h2 {
        font-size: 1.2rem;
        color: #003366;
        margin: 0 0 0.75rem 0;
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
</style>
