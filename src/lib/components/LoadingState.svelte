<script lang="ts">
    import type { Snippet } from 'svelte';

    let { loading, error, empty = false, emptyMessage = 'No data found.', children }: {
        loading: boolean;
        error?: string | null;
        empty?: boolean;
        emptyMessage?: string;
        children: Snippet;
    } = $props();
</script>

{#if loading}
    <p class="loading-text" aria-live="polite">Loading...</p>
{:else if error}
    <div class="alert-error" role="alert">{error}</div>
{:else if empty}
    <p class="empty-text">{emptyMessage}</p>
{:else}
    {@render children()}
{/if}

<style>
    .loading-text,
    .empty-text {
        color: #555;
        font-style: italic;
        padding: 1rem 0;
    }

    .alert-error {
        background: #f8d7da;
        color: #721c24;
        border: 1px solid #f5c6cb;
        padding: 0.75rem 1rem;
        border-radius: 0.375rem;
        margin-bottom: 1rem;
        font-size: 0.9rem;
    }
</style>
