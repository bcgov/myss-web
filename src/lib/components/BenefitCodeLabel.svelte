<script lang="ts">
    const BENEFIT_CODE_LABELS: Record<number, string> = {
        32: 'Housing Stability Supplement',
        41: 'Support',
        42: 'Shelter',
        73: 'Hardship / Comforts Allowance',
    };

    let { code }: { code: number } = $props();

    let label = $derived(BENEFIT_CODE_LABELS[code] ?? `Benefit Code ${code}`);
</script>

<span class="benefit-code-label">{label}</span>
