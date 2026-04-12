<script lang="ts">
    import { page } from '$app/state';
    import {
        submitServiceRequest,
        type SRSubmitResponse,
    } from '$lib/api/service-requests';
    import { getToken } from '$lib/utils/auth-token';

    let srId = $derived(page.params.id);

    let pin = $state('');
    let spousePin = $state('');
    let includeSpousePin = $state(false);
    let declarationAccepted = $state(false);
    let submitting = $state(false);
    let error: string | null = $state(null);
    let successResponse: SRSubmitResponse | null = $state(null);


    let canSubmit = $derived(declarationAccepted && pin.trim().length > 0 && !submitting);

    async function handleSubmit() {
        if (!canSubmit) return;
        submitting = true;
        error = null;
        try {
            const result = await submitServiceRequest(getToken(), srId, {
                pin: pin.trim(),
                spouse_pin: includeSpousePin && spousePin.trim() ? spousePin.trim() : null,
                declaration_accepted: declarationAccepted,
            });
            successResponse = result;
        } catch (e) {
            error = e instanceof Error ? e.message : 'Failed to submit service request.';
        } finally {
            submitting = false;
        }
    }
</script>

<svelte:head>
    <title>Submit Service Request</title>
</svelte:head>

<main class="submit-page">
    <nav class="breadcrumb" aria-label="Breadcrumb">
        <a href="/service-requests">My Service Requests</a>
        <span aria-hidden="true"> / </span>
        <a href="/service-requests/{srId}">Detail</a>
        <span aria-hidden="true"> / </span>
        <span aria-current="page">Submit</span>
    </nav>

    <h1>Submit Service Request</h1>

    {#if successResponse}
        <div class="success" role="status" aria-live="polite">
            <h2>Submission Successful</h2>
            <p>
                Your service request has been submitted. Your SR number is:
                <strong>{successResponse.sr_number}</strong>
            </p>
            <p class="submitted-at">Submitted at: {successResponse.submitted_at}</p>
            <a class="btn btn--primary" href="/service-requests">Back to My Service Requests</a>
        </div>
    {:else}
        <form class="submit-form" onsubmit={(e) => { e.preventDefault(); handleSubmit(); }} novalidate>
            <p class="form-intro">
                Please review your service request before submitting. Once submitted, you will
                receive a service request number for your records.
            </p>

            <div class="field">
                <label for="pin">PIN <span class="required" aria-hidden="true">*</span></label>
                <input
                    id="pin"
                    type="password"
                    bind:value={pin}
                    autocomplete="current-password"
                    maxlength="8"
                    required
                    aria-required="true"
                    placeholder="Enter your PIN"
                />
            </div>

            <div class="field field--checkbox">
                <label>
                    <input type="checkbox" bind:checked={includeSpousePin} />
                    Include spouse/partner PIN
                </label>
            </div>

            {#if includeSpousePin}
                <div class="field">
                    <label for="spouse-pin">Spouse / Partner PIN</label>
                    <input
                        id="spouse-pin"
                        type="password"
                        bind:value={spousePin}
                        autocomplete="off"
                        maxlength="8"
                        placeholder="Enter spouse / partner PIN"
                    />
                </div>
            {/if}

            <div class="declaration">
                <h2>Declaration</h2>
                <div class="declaration-text" tabindex="0">
                    <p>
                        I declare that the information I have provided in this service request is
                        true and complete to the best of my knowledge. I understand that providing
                        false information may result in consequences under the Employment and
                        Assistance Act.
                    </p>
                </div>
                <label class="field field--checkbox declaration-check">
                    <input
                        type="checkbox"
                        bind:checked={declarationAccepted}
                        required
                        aria-required="true"
                    />
                    I have read and accept the above declaration
                    <span class="required" aria-hidden="true">*</span>
                </label>
            </div>

            {#if error}
                <div class="error" role="alert">
                    <p>{error}</p>
                </div>
            {/if}

            <div class="actions">
                <a class="btn btn--secondary" href="/service-requests/{srId}">Cancel</a>
                <button
                    type="submit"
                    class="btn btn--primary"
                    disabled={!canSubmit}
                >
                    {submitting ? 'Submitting...' : 'Submit Service Request'}
                </button>
            </div>
        </form>
    {/if}
</main>

<style>
    .submit-page {
        max-width: 680px;
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
        margin-bottom: 1.5rem;
    }

    .success {
        background: #d4edda;
        border: 1px solid #c3e6cb;
        border-radius: 6px;
        padding: 1.5rem;
        color: #155724;
    }

    .success h2 {
        margin-top: 0;
        font-size: 1.3rem;
    }

    .submitted-at {
        font-size: 0.85rem;
        color: #2d6a4f;
        margin-bottom: 1rem;
    }

    .submit-form {
        background: white;
        border: 1px solid #dee2e6;
        border-radius: 6px;
        padding: 1.5rem;
    }

    .form-intro {
        color: #555;
        margin-bottom: 1.5rem;
        font-size: 0.95rem;
    }

    .field {
        margin-bottom: 1.25rem;
        display: flex;
        flex-direction: column;
        gap: 0.35rem;
    }

    .field label {
        font-weight: 600;
        font-size: 0.95rem;
        color: #333;
    }

    .field input[type='password'],
    .field input[type='text'] {
        padding: 0.5rem 0.75rem;
        border: 1px solid #adb5bd;
        border-radius: 4px;
        font-size: 0.95rem;
        max-width: 280px;
    }

    .field input[type='password']:focus,
    .field input[type='text']:focus {
        outline: 2px solid #003366;
        outline-offset: 1px;
        border-color: #003366;
    }

    .field--checkbox {
        flex-direction: row;
        align-items: center;
        gap: 0.5rem;
    }

    .field--checkbox label {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        font-weight: 400;
        cursor: pointer;
    }

    .required {
        color: #c00;
    }

    .declaration {
        margin: 1.5rem 0;
        padding: 1rem;
        background: #f8f9fa;
        border: 1px solid #dee2e6;
        border-radius: 4px;
    }

    .declaration h2 {
        font-size: 1.05rem;
        color: #003366;
        margin: 0 0 0.75rem;
    }

    .declaration-text {
        font-size: 0.9rem;
        color: #444;
        margin-bottom: 0.75rem;
        max-height: 8rem;
        overflow-y: auto;
        border: 1px solid #dee2e6;
        background: white;
        padding: 0.75rem;
        border-radius: 3px;
    }

    .declaration-check {
        margin-top: 0.75rem;
        font-weight: 600;
    }

    .error {
        background: #f8d7da;
        color: #721c24;
        border: 1px solid #f5c6cb;
        border-radius: 4px;
        padding: 0.75rem 1rem;
        margin-bottom: 1rem;
    }

    .actions {
        display: flex;
        gap: 0.75rem;
        margin-top: 1.5rem;
        flex-wrap: wrap;
        align-items: center;
    }

    .btn {
        display: inline-block;
        padding: 0.55rem 1.4rem;
        border-radius: 4px;
        font-size: 0.95rem;
        font-weight: 600;
        text-decoration: none;
        cursor: pointer;
        border: 2px solid transparent;
        transition: background 0.15s, color 0.15s;
    }

    .btn--primary {
        background: #003366;
        color: white;
        border-color: #003366;
    }

    .btn--primary:hover:not(:disabled) {
        background: #002244;
    }

    .btn--primary:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }

    .btn--secondary {
        background: white;
        color: #003366;
        border-color: #003366;
    }

    .btn--secondary:hover {
        background: #003366;
        color: white;
    }
</style>
