<script lang="ts">
    import type { SD81Status } from '$lib/api/monthly-reports';

    let { status }: { status: SD81Status } = $props();

    type BadgeColor = 'green' | 'yellow' | 'blue' | 'grey';

    function getBadgeColor(s: SD81Status): BadgeColor {
        if (s === 'SUB') return 'green';
        if (s === 'PRT' || s === 'PND') return 'yellow';
        if (s === 'RES') return 'blue';
        // RST
        return 'grey';
    }

    const statusLabels: Record<SD81Status, string> = {
        SUB: 'Submitted',
        PRT: 'In Progress',
        PND: 'Pending',
        RES: 'Resolved',
        RST: 'Restarted',
    };

    let color = $derived(getBadgeColor(status));
    let label = $derived(statusLabels[status] ?? status);

    const colorClasses: Record<BadgeColor, string> = {
        green: 'badge badge--green',
        yellow: 'badge badge--yellow',
        blue: 'badge badge--blue',
        grey: 'badge badge--grey',
    };

    let className = $derived(colorClasses[color]);
</script>

<span class={className}>{label}</span>

<style>
    .badge {
        display: inline-block;
        padding: 0.2rem 0.6rem;
        border-radius: 0.25rem;
        font-size: 0.8rem;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.03em;
    }

    .badge--green {
        background-color: #d4edda;
        color: #155724;
    }

    .badge--yellow {
        background-color: #fff3cd;
        color: #856404;
    }

    .badge--blue {
        background-color: #cce5ff;
        color: #004085;
    }

    .badge--grey {
        background-color: #e2e3e5;
        color: #383d41;
    }
</style>
