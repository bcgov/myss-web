<script lang="ts">
    import type { PaymentInfoResponse } from '$lib/api/payment';
    import BenefitCodeLabel from '$lib/components/BenefitCodeLabel.svelte';

    let { data }: { data: PaymentInfoResponse } = $props();

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

    function formatCurrency(amount: number): string {
        return new Intl.NumberFormat('en-CA', {
            style: 'currency',
            currency: 'CAD',
        }).format(amount);
    }
</script>

<div class="payment-summary">
    <!-- Upcoming Benefit -->
    <section class="summary-section">
        <h2>Upcoming Benefit</h2>
        <dl class="info-grid">
            <dt>Benefit Date</dt>
            <dd>{formatDate(data.upcoming_benefit_date)}</dd>
            <dt>Assistance Type</dt>
            <dd>{data.assistance_type}</dd>
        </dl>
    </section>

    <!-- MIS Payment Data -->
    <section class="summary-section">
        <h2>Payment Details</h2>
        <dl class="info-grid">
            <dt>Payment Method</dt>
            <dd>{data.mis_data.payment_method}</dd>
            <dt>Payment Distribution</dt>
            <dd>{data.mis_data.payment_distribution}</dd>
            <dt>Key Player</dt>
            <dd>{data.mis_data.key_player_name}</dd>
            {#if data.mis_data.spouse_name}
                <dt>Spouse</dt>
                <dd>{data.mis_data.spouse_name}</dd>
            {/if}
            {#if data.mis_data.aee_balance !== null}
                <dt>AEE Balance</dt>
                <dd>{formatCurrency(data.mis_data.aee_balance)}</dd>
            {/if}
        </dl>

        {#if data.mis_data.allowances.length > 0}
            <h3>Allowances</h3>
            <table class="data-table">
                <thead>
                    <tr>
                        <th scope="col">Benefit</th>
                        <th scope="col" class="amount-col">Amount</th>
                    </tr>
                </thead>
                <tbody>
                    {#each data.mis_data.allowances as allowance}
                        <tr>
                            <td>
                                <BenefitCodeLabel code={allowance.code} />
                                {#if allowance.description}
                                    <span class="item-description">{allowance.description}</span>
                                {/if}
                            </td>
                            <td class="amount-col">{formatCurrency(allowance.amount)}</td>
                        </tr>
                    {/each}
                </tbody>
            </table>
        {/if}

        {#if data.mis_data.deductions.length > 0}
            <h3>Deductions</h3>
            <table class="data-table">
                <thead>
                    <tr>
                        <th scope="col">Description</th>
                        <th scope="col" class="amount-col">Amount</th>
                    </tr>
                </thead>
                <tbody>
                    {#each data.mis_data.deductions as deduction}
                        <tr>
                            <td>
                                {deduction.description || deduction.code}
                            </td>
                            <td class="amount-col">{formatCurrency(deduction.amount)}</td>
                        </tr>
                    {/each}
                </tbody>
            </table>
        {/if}
    </section>

    <!-- Supplements -->
    {#if data.supplements.length > 0}
        <section class="summary-section">
            <h2>Supplements</h2>
            <table class="data-table">
                <thead>
                    <tr>
                        <th scope="col">Code</th>
                        <th scope="col" class="amount-col">Amount</th>
                        <th scope="col">Effective Date</th>
                    </tr>
                </thead>
                <tbody>
                    {#each data.supplements as supplement}
                        <tr>
                            <td>{supplement.code}</td>
                            <td class="amount-col">{formatCurrency(supplement.amount)}</td>
                            <td>{formatDate(supplement.effective_date)}</td>
                        </tr>
                    {/each}
                </tbody>
            </table>
        </section>
    {/if}

    <!-- Service Provider Payments -->
    {#if data.service_provider_payments.length > 0}
        <section class="summary-section">
            <h2>Service Provider Payments</h2>
            <table class="data-table">
                <thead>
                    <tr>
                        <th scope="col">Provider</th>
                        <th scope="col" class="amount-col">Amount</th>
                        <th scope="col">Payment Date</th>
                    </tr>
                </thead>
                <tbody>
                    {#each data.service_provider_payments as spp}
                        <tr>
                            <td>{spp.provider_name}</td>
                            <td class="amount-col">{formatCurrency(spp.amount)}</td>
                            <td>{formatDate(spp.payment_date)}</td>
                        </tr>
                    {/each}
                </tbody>
            </table>
        </section>
    {/if}
</div>

<style>
    .payment-summary {
        font-family: 'BC Sans', Arial, sans-serif;
    }

    .summary-section {
        margin-bottom: 2rem;
    }

    h2 {
        font-size: 1.25rem;
        color: #003366;
        margin: 0 0 0.75rem;
        padding-bottom: 0.4rem;
        border-bottom: 2px solid #FCBA19;
    }

    h3 {
        font-size: 1rem;
        color: #333;
        margin: 1.25rem 0 0.5rem;
        font-weight: 700;
    }

    .info-grid {
        display: grid;
        grid-template-columns: max-content 1fr;
        gap: 0.35rem 1.5rem;
        margin: 0 0 1rem;
        font-size: 0.95rem;
    }

    dt {
        color: #555;
        font-weight: 600;
    }

    dd {
        margin: 0;
        color: #222;
    }

    .data-table {
        width: 100%;
        border-collapse: collapse;
        font-size: 0.95rem;
    }

    .data-table th,
    .data-table td {
        padding: 0.6rem 0.75rem;
        text-align: left;
        border-bottom: 1px solid #dee2e6;
    }

    .data-table th {
        background-color: #f2f2f2;
        font-weight: 700;
        color: #333;
    }

    .data-table tbody tr:hover {
        background-color: #f8f9fa;
    }

    .amount-col {
        text-align: right;
        font-variant-numeric: tabular-nums;
        white-space: nowrap;
    }

    .item-description {
        display: block;
        font-size: 0.8rem;
        color: #666;
        margin-top: 0.1rem;
    }
</style>
