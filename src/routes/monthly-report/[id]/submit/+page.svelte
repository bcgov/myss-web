<script lang="ts">
    import { onMount } from 'svelte';
    import { page } from '$app/state';
    import {
        getCurrentPeriod,
        submitReport,
        type ChequeScheduleWindow,
        type SD81SubmitResponse,
    } from '$lib/api/monthly-reports';
    import ReportingPeriodBanner from '$lib/components/ReportingPeriodBanner.svelte';

    let sd81Id = $derived(page.params.id);

    let period: ChequeScheduleWindow | null = $state(null);
    let pin = $state('');
    let spousePin = $state('');
    let includeSpousePin = $state(false);
    let submitting = $state(false);
    let error: string | null = $state(null);
    let successResponse: SD81SubmitResponse | null = $state(null);

    function getToken(): string {
        return (typeof window !== 'undefined' && window.sessionStorage.getItem('auth_token')) ?? '';
    }

    let periodClosed = $derived(period ? new Date(period.period_close_date) < new Date() : false);
    let canSubmit = $derived(pin.trim().length > 0 && !submitting && !periodClosed);

    onMount(async () => {
        try {
            period = await getCurrentPeriod(getToken());
        } catch {
            // Non-fatal — period banner is optional
        }
    });

    async function handleSubmit() {
        if (!canSubmit) return;
        submitting = true;
        error = null;
        try {
            successResponse = await submitReport(getToken(), sd81Id, {
                pin: pin.trim(),
                spouse_pin: includeSpousePin && spousePin.trim() ? spousePin.trim() : null,
            });
        } catch (e) {
            error = e instanceof Error ? e.message : 'Failed to submit monthly report.';
        } finally {
            submitting = false;
        }
    }
</script>

<svelte:head>
    <title>Submit Monthly Report</title>
</svelte:head>

<main class="submit-page">
    <nav class="breadcrumb" aria-label="Breadcrumb">
        <a href="/monthly-report">Monthly Report</a>
        <span aria-hidden="true"> / </span>
        <a href="/monthly-report/{sd81Id}">Form</a>
        <span aria-hidden="true"> / </span>
        <span aria-current="page">Submit</span>
    </nav>

    <h1>Submit Monthly Report</h1>

    {#if period}
        <ReportingPeriodBanner {period} />
    {/if}

    {#if successResponse}
        <div class="success" role="status" aria-live="polite">
            <h2>Submission Successful</h2>
            <p>Your monthly report has been submitted.</p>
            <p class="submitted-at">
                Submitted at: {new Intl.DateTimeFormat('en-CA', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                }).format(new Date(successResponse.submitted_at))}
            </p>
            <a class="btn btn--primary" href="/monthly-report">Back to Monthly Reports</a>
        </div>
    {:else}
        <form class="submit-form" onsubmit={(e) => { e.preventDefault(); handleSubmit(); }} novalidate>
            <p class="form-intro">
                Please review your monthly report before submitting. Enter your PIN to confirm your
                identity and complete the submission.
            </p>

            {#if periodClosed}
                <div class="period-closed-warning" role="alert">
                    <strong>The reporting period is now closed.</strong> Submission is no longer
                    available for this benefit month.
                </div>
            {/if}

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
                    disabled={periodClosed}
                />
            </div>

            <div class="field field--checkbox">
                <label>
                    <input type="checkbox" bind:checked={includeSpousePin} disabled={periodClosed} />
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
                        disabled={periodClosed}
                    />
                </div>
            {/if}

            {#if error}
                <div class="error" role="alert">
                    <p>{error}</p>
                </div>
            {/if}

            <div class="actions">
                <a class="btn btn--secondary" href="/monthly-report/{sd81Id}">Back to Form</a>
                <button
                    type="submit"
                    class="btn btn--primary"
                    disabled={!canSubmit}
                >
                    {submitting ? 'Submitting...' : 'Submit Monthly Report'}
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
        margin-bottom: 1.25rem;
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

    .period-closed-warning {
        background: #f8d7da;
        color: #721c24;
        border: 1px solid #f5c6cb;
        border-radius: 4px;
        padding: 0.75rem 1rem;
        margin-bottom: 1.25rem;
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

    .field input[type='password'] {
        padding: 0.5rem 0.75rem;
        border: 1px solid #adb5bd;
        border-radius: 4px;
        font-size: 0.95rem;
        max-width: 280px;
    }

    .field input[type='password']:focus {
        outline: 2px solid #003366;
        outline-offset: 1px;
        border-color: #003366;
    }

    .field input:disabled {
        background: #f2f2f2;
        cursor: not-allowed;
        opacity: 0.7;
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
        font-family: inherit;
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
