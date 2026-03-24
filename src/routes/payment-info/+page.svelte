<script lang="ts">
    import { onMount } from 'svelte';
    import {
        getPaymentInfo,
        getChequeSchedule,
        getT5Slips,
        type PaymentInfoResponse,
        type ChequeScheduleResponse,
        type T5Slip,
    } from '$lib/api/payment';
    import PaymentSummary from '$lib/components/PaymentSummary.svelte';
    import T5SlipList from '$lib/components/T5SlipList.svelte';

    let paymentInfo: PaymentInfoResponse | null = $state(null);
    let chequeSchedule: ChequeScheduleResponse | null = $state(null);
    let t5Slips: T5Slip[] = $state([]);

    let loading = $state(true);
    let error: string | null = $state(null);

    function getToken(): string {
        return (typeof window !== 'undefined' && window.sessionStorage.getItem('auth_token')) ?? '';
    }

    function formatDate(isoString: string): string {
        try {
            return new Intl.DateTimeFormat('en-CA', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
            }).format(new Date(isoString));
        } catch {
            return isoString;
        }
    }

    async function fetchAll() {
        const token = getToken();
        const [infoResult, scheduleResult, t5Result] = await Promise.allSettled([
            getPaymentInfo(token),
            getChequeSchedule(token),
            getT5Slips(token),
        ]);

        if (infoResult.status === 'fulfilled') {
            paymentInfo = infoResult.value;
        }
        if (scheduleResult.status === 'fulfilled') {
            chequeSchedule = scheduleResult.value;
        }
        if (t5Result.status === 'fulfilled') {
            t5Slips = t5Result.value.slips;
        }

        // Redirect on 403 (case not open/active)
        if (infoResult.status === 'rejected') {
            const msg = infoResult.reason instanceof Error ? infoResult.reason.message : '';
            if (msg.includes('(403)')) {
                window.location.href = '/error?reason=case-not-active';
                return;
            }
            error = msg || 'Failed to load payment information.';
        }
    }

    onMount(async () => {
        try {
            await fetchAll();
        } catch (e) {
            error = e instanceof Error ? e.message : 'Failed to load payment information.';
        } finally {
            loading = false;
        }
    });

    async function handleRetry() {
        error = null;
        loading = true;
        paymentInfo = null;
        chequeSchedule = null;
        t5Slips = [];
        try {
            await fetchAll();
        } catch (e) {
            error = e instanceof Error ? e.message : 'Failed to load payment information.';
        } finally {
            loading = false;
        }
    }
</script>

<svelte:head>
    <title>Payment Information</title>
</svelte:head>

<main class="payment-info-page">
    <h1>Payment Information</h1>

    {#if loading}
        <p class="loading" aria-live="polite">Loading payment information...</p>
    {:else if error}
        <div class="error" role="alert">
            <p>{error}</p>
            <button onclick={handleRetry}>Try again</button>
        </div>
    {:else}
        <!-- Cheque Schedule Banner -->
        {#if chequeSchedule}
            <div class="schedule-banner">
                <h2>Cheque Schedule</h2>
                <dl class="schedule-grid">
                    <dt>Benefit Month</dt>
                    <dd>{formatDate(chequeSchedule.benefit_month)}</dd>
                    <dt>Income Date</dt>
                    <dd>{formatDate(chequeSchedule.income_date)}</dd>
                    <dt>Cheque Issue Date</dt>
                    <dd>{formatDate(chequeSchedule.cheque_issue_date)}</dd>
                    <dt>Period Close Date</dt>
                    <dd>{formatDate(chequeSchedule.period_close_date)}</dd>
                </dl>
            </div>
        {/if}

        <!-- Payment Summary -->
        {#if paymentInfo}
            <PaymentSummary data={paymentInfo} />
        {:else}
            <p class="empty">No payment information available.</p>
        {/if}

        <!-- T5 Slips -->
        <T5SlipList slips={t5Slips} token={getToken()} />
    {/if}
</main>

<style>
    .payment-info-page {
        max-width: 960px;
        margin: 2rem auto;
        padding: 0 1rem;
        font-family: 'BC Sans', Arial, sans-serif;
    }

    h1 {
        font-size: 1.75rem;
        color: #003366;
        margin-bottom: 1.25rem;
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
        padding: 1rem;
        margin-bottom: 1rem;
    }

    .error p {
        margin: 0 0 0.5rem;
    }

    .error button {
        padding: 0.4rem 0.8rem;
        cursor: pointer;
        background: white;
        border: 1px solid #721c24;
        border-radius: 4px;
        color: #721c24;
        font-size: 0.9rem;
        font-family: inherit;
    }

    .error button:hover {
        background: #721c24;
        color: white;
    }

    .schedule-banner {
        background: #f0f4f8;
        border: 1px solid #c6d4e3;
        border-radius: 6px;
        padding: 1.25rem 1.5rem;
        margin-bottom: 2rem;
    }

    .schedule-banner h2 {
        font-size: 1.1rem;
        color: #003366;
        margin: 0 0 0.75rem;
        font-weight: 700;
    }

    .schedule-grid {
        display: grid;
        grid-template-columns: max-content 1fr;
        gap: 0.35rem 1.5rem;
        margin: 0;
        font-size: 0.95rem;
    }

    .schedule-grid dt {
        color: #555;
        font-weight: 600;
    }

    .schedule-grid dd {
        margin: 0;
        color: #222;
    }
</style>
