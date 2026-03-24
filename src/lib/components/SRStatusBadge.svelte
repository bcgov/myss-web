<script lang="ts">
    let { status }: { status: string } = $props();

    type BadgeColor = 'green' | 'yellow' | 'red' | 'blue' | 'grey';

    function getBadgeColor(s: string): BadgeColor {
        const normalized = s.toLowerCase();
        if (normalized === 'open' || normalized === 'active' || normalized === 'approved') {
            return 'green';
        }
        if (normalized === 'pending' || normalized === 'in progress' || normalized === 'submitted') {
            return 'yellow';
        }
        if (normalized === 'denied' || normalized === 'cancelled' || normalized === 'rejected') {
            return 'red';
        }
        if (normalized === 'draft') {
            return 'blue';
        }
        return 'grey';
    }

    let color = $derived(getBadgeColor(status));

    const colorClasses: Record<BadgeColor, string> = {
        green: 'badge badge--green',
        yellow: 'badge badge--yellow',
        red: 'badge badge--red',
        blue: 'badge badge--blue',
        grey: 'badge badge--grey',
    };

    let className = $derived(colorClasses[color]);
</script>

<span class={className}>{status}</span>

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

    .badge--red {
        background-color: #f8d7da;
        color: #721c24;
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
