<script lang="ts">
    import type { Snippet } from 'svelte';

    let { variant = 'error', children }: {
        variant?: 'error' | 'success' | 'warning' | 'info';
        children: Snippet;
    } = $props();
</script>

<div class="alert alert--{variant}" role="alert">
    {@render children()}
</div>

<style>
    .alert {
        padding: 0.75rem 1rem;
        border-radius: 0.375rem;
        margin-bottom: 1rem;
        font-size: 0.9rem;
    }

    .alert--error {
        background: #f8d7da;
        color: #721c24;
        border: 1px solid #f5c6cb;
    }

    .alert--success {
        background: #d4edda;
        color: #155724;
        border: 1px solid #c3e6cb;
    }

    .alert--warning {
        background: #fff3cd;
        color: #856404;
        border: 1px solid #ffeeba;
    }

    .alert--info {
        background: #d1ecf1;
        color: #0c5460;
        border: 1px solid #bee5eb;
    }
</style>
