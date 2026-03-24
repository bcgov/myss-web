<script lang="ts">
    import WorkerRoleBadge from '$lib/components/WorkerRoleBadge.svelte';
    import type { LayoutData } from './$types';
    import type { Snippet } from 'svelte';

    let { children, data }: { children: Snippet; data: LayoutData } = $props();

    // All IDIR-authenticated users are workers; future: check role claim
    const role = 'Worker';
</script>

<div class="admin-shell">
    <header class="admin-header">
        <div class="admin-header__brand">
            <span class="admin-header__title">MySelfServe — Admin</span>
        </div>
        <div class="admin-header__user">
            <span class="admin-header__name">{data.session?.user?.name ?? 'Worker'}</span>
            <WorkerRoleBadge {role} />
        </div>
    </header>

    <main class="admin-content">
        {@render children()}
    </main>
</div>

<style>
    .admin-shell {
        min-height: 100vh;
        display: flex;
        flex-direction: column;
        font-family: 'BC Sans', Arial, sans-serif;
        background: #f4f6f8;
    }

    .admin-header {
        background: #003366;
        color: #fff;
        padding: 0.75rem 1.5rem;
        display: flex;
        align-items: center;
        justify-content: space-between;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
    }

    .admin-header__title {
        font-size: 1.1rem;
        font-weight: 700;
        letter-spacing: 0.01em;
    }

    .admin-header__user {
        display: flex;
        align-items: center;
        gap: 0.75rem;
    }

    .admin-header__name {
        font-size: 0.95rem;
        opacity: 0.9;
    }

    .admin-content {
        flex: 1;
        padding: 1.5rem;
    }
</style>
