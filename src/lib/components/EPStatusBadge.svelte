<script lang="ts">
    import type { EPStatus } from '$lib/api/employment-plans';

    let { status }: { status: EPStatus } = $props();

    type BadgeColor = 'blue' | 'green' | 'amber';

    function getBadgeColor(s: EPStatus): BadgeColor {
        if (s === 'Received') return 'blue';
        if (s === 'Submitted') return 'green';
        // PendingSignature
        return 'amber';
    }

    const statusLabels: Record<EPStatus, string> = {
        Received: 'Received',
        Submitted: 'Submitted',
        PendingSignature: 'Pending Signature',
    };

    let color = $derived(getBadgeColor(status));
    let label = $derived(statusLabels[status] ?? status);

    const colorClasses: Record<BadgeColor, string> = {
        blue: 'badge badge--blue',
        green: 'badge badge--green',
        amber: 'badge badge--amber',
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

    .badge--blue {
        background-color: #cce5ff;
        color: #004085;
    }

    .badge--green {
        background-color: #d4edda;
        color: #155724;
    }

    .badge--amber {
        background-color: #fff3cd;
        color: #856404;
    }
</style>
