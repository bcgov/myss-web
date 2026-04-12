<script lang="ts">
    import { onMount } from 'svelte';
    import {
        getBanners,
        listMessages,
        getMessageDetail,
        replyToMessage,
        deleteMessage,
    } from '$lib/api/messages';
    import type { BannerNotification, MessageSummary, MessageDetail } from '$lib/api/messages';
    import NotificationBanner from '$lib/components/NotificationBanner.svelte';
    import MessageInbox from '$lib/components/MessageInbox.svelte';
    import MessageDetailComponent from '$lib/components/MessageDetail.svelte';
    import ReplyForm from '$lib/components/ReplyForm.svelte';
    import { getToken } from '$lib/utils/auth-token';

    let banners: BannerNotification[] = $state([]);
    let messages: MessageSummary[] = $state([]);
    let total = $state(0);
    let loading = $state(true);
    let page = $state(1);

    let selectedMessage: MessageDetail | null = $state(null);
    let detailLoading = $state(false);
    let detailError: string | null = $state(null);

    let showReplyForm = $state(false);
    let replyError: string | null = $state(null);
    let replySuccess = $state(false);

    let error: string | null = $state(null);

    // Incrementing this counter triggers ReplyForm to reset via $effect
    let replyResetSignal = $state(0);


    async function fetchBanners() {
        try {
            banners = await getBanners(getToken());
        } catch {
            // Non-critical — silently ignore banner errors
        }
    }

    async function fetchMessages(currentPage: number) {
        try {
            const data = await listMessages(getToken(), currentPage);
            if (currentPage === 1) {
                messages = data.messages;
            } else {
                messages = [...messages, ...data.messages];
            }
            total = data.total;
        } catch (e) {
            error = e instanceof Error ? e.message : 'Failed to load messages.';
        }
    }

    onMount(async () => {
        await Promise.all([fetchBanners(), fetchMessages(1)]);
        loading = false;
    });

    async function handleLoadMore() {
        loading = true;
        page += 1;
        await fetchMessages(page);
        loading = false;
    }

    async function handleSelect(msgId: string) {
        detailLoading = true;
        detailError = null;
        showReplyForm = false;
        replyError = null;
        replySuccess = false;
        selectedMessage = null;

        try {
            selectedMessage = await getMessageDetail(getToken(), msgId);
            // Mark as read in the local list
            messages = messages.map((m) =>
                m.message_id === msgId ? { ...m, is_read: true } : m,
            );
        } catch (e) {
            detailError = e instanceof Error ? e.message : 'Failed to load message.';
        } finally {
            detailLoading = false;
        }
    }

    function handleReplyOpen() {
        showReplyForm = true;
        replyError = null;
        replySuccess = false;
    }

    async function handleReply(body: string) {
        if (!selectedMessage) return;
        replyError = null;
        replySuccess = false;
        try {
            await replyToMessage(getToken(), selectedMessage.message_id, { body });
            replySuccess = true;
            showReplyForm = false;
            replyResetSignal += 1;
        } catch (e) {
            replyError = e instanceof Error ? e.message : 'Failed to send reply.';
            replyResetSignal += 1;
        }
    }

    async function handleDelete(msgId: string) {
        if (!confirm('Are you sure you want to delete this message?')) return;
        try {
            await deleteMessage(getToken(), msgId);
            messages = messages.filter((m) => m.message_id !== msgId);
            total = Math.max(0, total - 1);
            if (selectedMessage?.message_id === msgId) {
                selectedMessage = null;
                showReplyForm = false;
            }
        } catch (e) {
            detailError = e instanceof Error ? e.message : 'Failed to delete message.';
        }
    }

    function handleRestart(msgId: string) {
        // Navigate to monthly report restart flow — placeholder for integration
        console.log('Restart monthly report from message:', msgId);
    }
</script>

<svelte:head>
    <title>Messages &amp; Notifications</title>
</svelte:head>

<main class="messages-page">
    <h1>Messages &amp; Notifications</h1>

    <NotificationBanner {banners} />

    {#if error}
        <div class="error" role="alert">
            <p>{error}</p>
            <button
                onclick={() => {
                    error = null;
                    loading = true;
                    page = 1;
                    fetchMessages(1).then(() => { loading = false; });
                }}
            >
                Try again
            </button>
        </div>
    {/if}

    <div class="layout">
        <!-- Left panel: inbox -->
        <aside class="inbox-panel">
            <MessageInbox
                {messages}
                {total}
                {loading}
                onselect={handleSelect}
                onloadMore={handleLoadMore}
            />
        </aside>

        <!-- Right panel: detail -->
        <section class="detail-panel">
            {#if detailLoading}
                <p class="loading">Loading message...</p>
            {:else if detailError}
                <div class="error" role="alert">
                    <p>{detailError}</p>
                </div>
            {:else}
                <MessageDetailComponent
                    message={selectedMessage}
                    onreply={handleReplyOpen}
                    ondelete={handleDelete}
                    onrestart={handleRestart}
                />

                {#if replySuccess}
                    <div class="success" role="status">
                        Your reply has been sent.
                    </div>
                {/if}

                {#if replyError}
                    <div class="error" role="alert">
                        <p>{replyError}</p>
                    </div>
                {/if}

                {#if showReplyForm && selectedMessage}
                    <ReplyForm
                        messageId={selectedMessage.message_id}
                        disabled={false}
                        resetSignal={replyResetSignal}
                        onreply={handleReply}
                    />
                {/if}
            {/if}
        </section>
    </div>
</main>

<style>
    .messages-page {
        max-width: 1100px;
        margin: 2rem auto;
        padding: 0 1rem;
        font-family: 'BC Sans', Arial, sans-serif;
    }

    h1 {
        font-size: 1.75rem;
        color: #003366;
        margin-bottom: 1.25rem;
    }

    .layout {
        display: grid;
        grid-template-columns: 340px 1fr;
        gap: 1.5rem;
        align-items: start;
    }

    @media (max-width: 720px) {
        .layout {
            grid-template-columns: 1fr;
        }
    }

    .inbox-panel {
        /* sticky so it stays visible while scrolling detail */
        position: sticky;
        top: 1rem;
    }

    .detail-panel {
        min-height: 300px;
    }

    .loading {
        color: #555;
        font-style: italic;
    }

    .error {
        background: #f8d7da;
        color: #721c24;
        border: 1px solid #f5c6cb;
        border-radius: 4px;
        padding: 0.75rem 1rem;
        margin-bottom: 1rem;
    }

    .error p {
        margin: 0 0 0.4rem;
    }

    .error button {
        padding: 0.35rem 0.75rem;
        cursor: pointer;
        background: white;
        border: 1px solid #721c24;
        border-radius: 4px;
        color: #721c24;
        font-size: 0.9rem;
    }

    .success {
        background: #d4edda;
        color: #155724;
        border: 1px solid #c3e6cb;
        border-radius: 4px;
        padding: 0.75rem 1rem;
        margin-top: 1rem;
        font-size: 0.95rem;
    }
</style>
