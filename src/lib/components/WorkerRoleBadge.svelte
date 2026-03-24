<script lang="ts">
    let { role }: { role: string } = $props();

    let isSuperAdmin = $derived(role.toLowerCase() === 'super admin' || role.toLowerCase() === 'superadmin');
</script>

<span class="badge" class:badge--blue={!isSuperAdmin} class:badge--purple={isSuperAdmin}>
    {role}
</span>

<style>
    .badge {
        display: inline-block;
        padding: 0.2rem 0.6rem;
        border-radius: 0.25rem;
        font-size: 0.75rem;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.05em;
    }

    .badge--blue {
        background-color: #cce5ff;
        color: #004085;
    }

    .badge--purple {
        background-color: #e2d9f3;
        color: #4a1d96;
    }
</style>
