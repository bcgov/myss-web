<script lang="ts">
    import { onMount } from 'svelte';
    import { goto } from '$app/navigation';
    import {
        getCurrentPeriod,
        listReports,
        startReport,
        restartReport,
        type ChequeScheduleWindow,
        type SD81Summary,
        type SD81Status,
    } from '$lib/api/monthly-reports';
    import SD81StatusBadge from '$lib/components/SD81StatusBadge.svelte';
    import ReportingPeriodBanner from '$lib/components/ReportingPeriodBanner.svelte';
    import { getToken } from '$lib/utils/auth-token';

    let period: ChequeScheduleWindow | null = $state(null);
    let reports: SD81Summary[] = $state([]);
    let loading = $state(true);
    let error: string | null = $state(null);

    // Track which report IDs have a restart in-flight
    let restartingIds = $state(new Set<string>());


    function formatMonth(dateStr: string): string {
        try {
            return new Intl.DateTimeFormat('en-CA', {
                year: 'numeric',
                month: 'long',
            }).format(new Date(dateStr));
        } catch {
            return dateStr;
        }
    }

    let currentPeriodClosed = $derived(period ? new Date(period.period_close_date) < new Date() : false);

    onMount(async () => {
        try {
            const [periodResult, listResult] = await Promise.allSettled([
                getCurrentPeriod(getToken()),
                listReports(getToken()),
            ]);

            if (periodResult.status === 'fulfilled') {
                period = periodResult.value;
            }
            if (listResult.status === 'fulfilled') {
                reports = listResult.value.reports;
            }

            if (periodResult.status === 'rejected' && listResult.status === 'rejected') {
                error = 'Failed to load monthly report data.';
            }
        } catch (e) {
            error = e instanceof Error ? e.message : 'Failed to load monthly report data.';
        } finally {
            loading = false;
        }
    });

    async function handleStart() {
        try {
            const result = await startReport(getToken());
            await goto(`/monthly-report/${result.sd81_id}`);
        } catch (e) {
            error = e instanceof Error ? e.message : 'Failed to start monthly report.';
        }
    }

    async function handleRestart(sd81Id: string) {
        restartingIds = new Set([...restartingIds, sd81Id]);
        try {
            const report = await restartReport(getToken(), sd81Id);
            await goto(`/monthly-report/${report.sd81_id}`);
        } catch (e) {
            error = e instanceof Error ? e.message : 'Failed to restart monthly report.';
            restartingIds = new Set([...restartingIds].filter((id) => id !== sd81Id));
        }
    }

    function getRowAction(
        report: SD81Summary,
    ): { label: string; action: 'continue' | 'view' | 'restart' } | null {
        if (report.status === 'PRT') return { label: 'Continue', action: 'continue' };
        if (report.status === 'SUB' || report.status === 'RES') return { label: 'View', action: 'view' };
        if (report.status === 'RST') return { label: 'Restart', action: 'restart' };
        return null;
    }

    // Determine if current period has a report already started/submitted
    let currentPeriodReport = $derived(period
        ? reports.find((r) => r.benefit_month === period!.benefit_month) ?? null
        : null);

    let canStartNewReport = $derived(period !== null && currentPeriodReport === null && !currentPeriodClosed);
</script>

<svelte:head>
    <title>Monthly Report</title>
</svelte:head>

<main class="monthly-report-page">
    <h1>Monthly Report</h1>

    {#if loading}
        <p class="loading" aria-live="polite">Loading monthly report information...</p>
    {:else if error}
        <div class="error" role="alert">
            <p>{error}</p>
            <button
                onclick={() => {
                    error = null;
                    loading = true;
                    Promise.allSettled([
                        getCurrentPeriod(getToken()),
                        listReports(getToken()),
                    ]).then(([p, l]) => {
                        if (p.status === 'fulfilled') period = p.value;
                        if (l.status === 'fulfilled') reports = l.value.reports;
                        loading = false;
                    });
                }}
            >
                Try again
            </button>
        </div>
    {:else}
        {#if period}
            <ReportingPeriodBanner {period} />
        {/if}

        {#if canStartNewReport}
            <div class="start-section">
                <p>You have not yet submitted a monthly report for {formatMonth(period!.benefit_month)}.</p>
                <button
                    class="btn btn--primary"
                    onclick={() => handleStart()}
                >
                    Start Report
                </button>
            </div>
        {:else if currentPeriodReport && currentPeriodReport.status === 'PRT'}
            <div class="start-section">
                <p>You have an in-progress report for {formatMonth(period!.benefit_month)}.</p>
                <a class="btn btn--primary" href="/monthly-report/{currentPeriodReport.sd81_id}">
                    Continue Report
                </a>
            </div>
        {/if}

        {#if reports.length > 0}
            <section class="history-section">
                <h2>Report History</h2>
                <table class="report-table">
                    <thead>
                        <tr>
                            <th scope="col">Benefit Month</th>
                            <th scope="col">Status</th>
                            <th scope="col">Submitted</th>
                            <th scope="col">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {#each reports as report (report.sd81_id)}
                            {@const rowAction = getRowAction(report)}
                            <tr>
                                <td>{formatMonth(report.benefit_month)}</td>
                                <td><SD81StatusBadge status={report.status} /></td>
                                <td>
                                    {#if report.submitted_at}
                                        {new Intl.DateTimeFormat('en-CA', {
                                            year: 'numeric',
                                            month: 'short',
                                            day: 'numeric',
                                        }).format(new Date(report.submitted_at))}
                                    {:else}
                                        <span class="not-submitted">—</span>
                                    {/if}
                                </td>
                                <td class="actions-cell">
                                    {#if rowAction}
                                        {#if rowAction.action === 'continue' || rowAction.action === 'view'}
                                            <a
                                                class="btn-action btn-action--{rowAction.action === 'view' ? 'secondary' : 'primary'}"
                                                href="/monthly-report/{report.sd81_id}{rowAction.action === 'view' ? '' : ''}"
                                            >
                                                {rowAction.label}
                                            </a>
                                        {:else if rowAction.action === 'restart'}
                                            <button
                                                class="btn-action btn-action--warning"
                                                disabled={restartingIds.has(report.sd81_id)}
                                                onclick={() => handleRestart(report.sd81_id)}
                                            >
                                                {restartingIds.has(report.sd81_id) ? 'Restarting...' : 'Restart'}
                                            </button>
                                        {/if}
                                    {:else}
                                        <span class="no-action">—</span>
                                    {/if}
                                </td>
                            </tr>
                        {/each}
                    </tbody>
                </table>
            </section>
        {:else}
            <p class="empty">No monthly reports on file.</p>
        {/if}
    {/if}
</main>

<style>
    .monthly-report-page {
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

    h2 {
        font-size: 1.25rem;
        color: #003366;
        margin-bottom: 0.75rem;
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

    .error button {
        margin-top: 0.5rem;
        padding: 0.4rem 0.8rem;
        cursor: pointer;
    }

    .start-section {
        background: #f0f4f8;
        border: 1px solid #c6d4e3;
        border-radius: 6px;
        padding: 1.25rem 1.5rem;
        margin-bottom: 1.5rem;
        display: flex;
        align-items: center;
        gap: 1.25rem;
        flex-wrap: wrap;
    }

    .start-section p {
        margin: 0;
        color: #333;
        flex: 1;
    }

    .history-section {
        margin-top: 1rem;
    }

    .report-table {
        width: 100%;
        border-collapse: collapse;
        font-size: 0.95rem;
    }

    .report-table th,
    .report-table td {
        padding: 0.65rem 0.75rem;
        text-align: left;
        border-bottom: 1px solid #dee2e6;
    }

    .report-table th {
        background-color: #f2f2f2;
        font-weight: 700;
        color: #333;
    }

    .report-table tbody tr:hover {
        background-color: #f8f9fa;
    }

    .actions-cell {
        white-space: nowrap;
    }

    .not-submitted,
    .no-action {
        color: #aaa;
    }

    .btn--primary {
        display: inline-block;
        padding: 0.5rem 1.25rem;
        background: #003366;
        color: white;
        border: 2px solid #003366;
        border-radius: 4px;
        font-size: 0.95rem;
        font-weight: 600;
        text-decoration: none;
        cursor: pointer;
        font-family: inherit;
        transition: background 0.15s;
    }

    .btn--primary:hover {
        background: #002244;
    }

    .btn-action {
        display: inline-block;
        padding: 0.35rem 0.85rem;
        border-radius: 4px;
        font-size: 0.85rem;
        font-weight: 600;
        text-decoration: none;
        cursor: pointer;
        border: 1px solid transparent;
        font-family: inherit;
        transition: background 0.15s, color 0.15s;
    }

    .btn-action--primary {
        background: #003366;
        color: white;
        border-color: #003366;
    }

    .btn-action--primary:hover {
        background: #002244;
    }

    .btn-action--secondary {
        background: white;
        color: #003366;
        border-color: #003366;
    }

    .btn-action--secondary:hover {
        background: #003366;
        color: white;
    }

    .btn-action--warning {
        background: white;
        color: #856404;
        border-color: #ffc107;
    }

    .btn-action--warning:hover:not(:disabled) {
        background: #ffc107;
        color: #333;
    }

    .btn-action--warning:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }
</style>
