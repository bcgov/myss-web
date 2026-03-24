<script lang="ts">
    import type { BannerNotification } from '$lib/api/messages';

    let { banners = [] }: { banners?: BannerNotification[] } = $props();

    const now = new Date();

    let activeBanners = $derived(banners.filter((b) => new Date(b.end_date) >= now));
</script>

{#if activeBanners.length > 0}
    <div class="banners">
        {#each activeBanners as banner (banner.notification_id)}
            <div class="banner" role="note">
                <span class="banner-icon" aria-hidden="true">ℹ</span>
                <span class="banner-body">{banner.body}</span>
            </div>
        {/each}
    </div>
{/if}

<style>
    .banners {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
        margin-bottom: 1.25rem;
    }

    .banner {
        display: flex;
        align-items: flex-start;
        gap: 0.6rem;
        background: #d6e4f7;
        border: 1px solid #aac8ef;
        border-left: 4px solid #1a5a96;
        border-radius: 4px;
        padding: 0.75rem 1rem;
        font-family: 'BC Sans', Arial, sans-serif;
        font-size: 0.95rem;
        color: #003366;
    }

    .banner-icon {
        font-style: normal;
        font-weight: 700;
        flex-shrink: 0;
        color: #1a5a96;
    }

    .banner-body {
        flex: 1;
        line-height: 1.5;
    }
</style>
