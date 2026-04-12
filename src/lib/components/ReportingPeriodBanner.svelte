<script lang="ts">
    import type { ChequeScheduleWindow } from '$lib/api/monthly-reports';
    import { formatDate } from '$lib/utils/format-date';

    let { period }: { period: ChequeScheduleWindow } = $props();

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

    let isClosed = $derived(new Date(period.period_close_date) < new Date());
</script>

<div class="period-banner" class:period-banner--closed={isClosed}>
    {#if isClosed}
        <div class="closed-notice" role="alert">
            <strong>Period Closed</strong> — The reporting period for this benefit month has ended.
        </div>
    {/if}

    <div class="period-details">
        <h2 class="period-title">Reporting Period: {formatMonth(period.benefit_month)}</h2>
        <dl class="period-fields">
            <dt>Benefit Month</dt>
            <dd>{formatMonth(period.benefit_month)}</dd>

            <dt>Income Date</dt>
            <dd>{formatDate(period.income_date)}</dd>

            <dt>Cheque Issue Date</dt>
            <dd>{formatDate(period.cheque_issue_date)}</dd>

            <dt>Period Close Date</dt>
            <dd class:closed-date={isClosed}>{formatDate(period.period_close_date)}</dd>
        </dl>
    </div>
</div>

<style>
    .period-banner {
        background: #f0f4f8;
        border: 1px solid #c6d4e3;
        border-radius: 6px;
        padding: 1.25rem 1.5rem;
        margin-bottom: 1.5rem;
    }

    .period-banner--closed {
        border-color: #f5c6cb;
        background: #fff5f5;
    }

    .closed-notice {
        background: #f8d7da;
        color: #721c24;
        border: 1px solid #f5c6cb;
        border-radius: 4px;
        padding: 0.65rem 1rem;
        margin-bottom: 1rem;
        font-size: 0.95rem;
    }

    .period-title {
        font-size: 1.1rem;
        color: #003366;
        margin: 0 0 0.75rem;
    }

    .period-fields {
        display: grid;
        grid-template-columns: auto 1fr;
        gap: 0.3rem 1.25rem;
        font-size: 0.9rem;
        margin: 0;
    }

    .period-fields dt {
        font-weight: 600;
        color: #444;
        white-space: nowrap;
    }

    .period-fields dd {
        margin: 0;
        color: #555;
    }

    .closed-date {
        color: #721c24;
        font-weight: 600;
    }
</style>
