<script lang="ts">
    import type { T5Slip } from '$lib/api/payment';
    import { API_BASE_URL } from '$lib/api/client';

    let { slips, token }: { slips: T5Slip[]; token: string } = $props();

    let downloading: number | null = $state(null);
    let downloadError: string | null = $state(null);

    async function downloadPdf(year: number) {
        downloading = year;
        downloadError = null;
        try {
            const response = await fetch(`${API_BASE_URL}/payment/t5-slips/${year}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (!response.ok) {
                throw new Error(`Download failed (${response.status})`);
            }
            const blob = await response.blob();
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `T5007_${year}.pdf`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        } catch (e) {
            downloadError = e instanceof Error ? e.message : 'Download failed';
        } finally {
            downloading = null;
        }
    }
</script>

<div class="t5-slips">
    <h3>T5007 Tax Slips</h3>
    {#if downloadError}
    <div class="download-error" role="alert">
        <p>{downloadError}</p>
    </div>
    {/if}
    {#if slips.length > 0}
    <table class="t5-table">
        <thead>
            <tr>
                <th scope="col">Tax Year</th>
                <th scope="col" class="amount-col">Box 10</th>
                <th scope="col" class="amount-col">Box 11</th>
                <th scope="col">Download</th>
            </tr>
        </thead>
        <tbody>
            {#each slips as slip (slip.tax_year)}
            <tr>
                <td>{slip.tax_year}</td>
                <td class="amount-col">${slip.box_10_amount.toFixed(2)}</td>
                <td class="amount-col">${slip.box_11_amount.toFixed(2)}</td>
                <td>
                    {#if slip.available}
                    <button
                        class="download-link"
                        onclick={() => downloadPdf(slip.tax_year)}
                        disabled={downloading === slip.tax_year}
                    >
                        {downloading === slip.tax_year ? 'Downloading...' : 'Download PDF'}
                    </button>
                    {:else}
                    <span class="unavailable">Not available</span>
                    {/if}
                </td>
            </tr>
            {/each}
        </tbody>
    </table>
    {:else}
    <p class="empty">No T5007 tax slips are available.</p>
    {/if}
</div>

<style>
    .t5-slips {
        margin-top: 2rem;
        font-family: 'BC Sans', Arial, sans-serif;
    }

    h3 {
        font-size: 1.25rem;
        color: #003366;
        margin: 0 0 0.75rem;
        padding-bottom: 0.4rem;
        border-bottom: 2px solid #FCBA19;
    }

    .t5-table {
        width: 100%;
        border-collapse: collapse;
        font-size: 0.95rem;
    }

    .t5-table th,
    .t5-table td {
        padding: 0.6rem 0.75rem;
        text-align: left;
        border-bottom: 1px solid #dee2e6;
    }

    .t5-table th {
        background-color: #f2f2f2;
        font-weight: 700;
        color: #333;
    }

    .t5-table tbody tr:hover {
        background-color: #f8f9fa;
    }

    .amount-col {
        text-align: right;
        font-variant-numeric: tabular-nums;
        white-space: nowrap;
    }

    .download-link {
        background: none;
        border: none;
        color: #003366;
        font-weight: 600;
        text-decoration: underline;
        cursor: pointer;
        font-size: inherit;
        font-family: inherit;
        padding: 0;
    }

    .download-link:hover {
        color: #002244;
    }

    .download-link:disabled {
        color: #888;
        cursor: wait;
        text-decoration: none;
    }

    .unavailable {
        color: #888;
        font-style: italic;
    }

    .empty {
        color: #555;
        font-style: italic;
    }

    .download-error {
        background: #f8d7da;
        color: #721c24;
        border: 1px solid #f5c6cb;
        border-radius: 4px;
        padding: 0.75rem 1rem;
        margin-bottom: 0.75rem;
        font-size: 0.9rem;
    }

    .download-error p {
        margin: 0;
    }
</style>
