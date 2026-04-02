<script lang="ts">
	import { browser, dev } from '$app/environment';
	import favicon from '$lib/assets/favicon.svg';
	import type { LayoutData } from './$types';
	import type { Snippet } from 'svelte';

	let { children, data }: { children: Snippet; data: LayoutData } = $props();

	// Bridge: write the server session's accessToken into sessionStorage
	// so client-side API calls (getToken() pattern) can find it.
	//
	// Two writes are needed:
	//   1. Synchronous — runs during component init, BEFORE children mount,
	//      so page onMount() handlers find the token in sessionStorage.
	//   2. Reactive ($effect) — re-runs when data.session changes on
	//      client-side navigation without a full page reload.
	function syncToken() {
		const session = data.session as Record<string, unknown> | null;
		const token = session?.accessToken;
		if (dev) {
			console.log('[layout] syncToken — session keys:', session ? Object.keys(session) : 'null');
			console.log('[layout] syncToken — accessToken type:', typeof token, 'value:', typeof token === 'string' ? token.substring(0, 30) + '...' : token);
		}
		if (typeof token === 'string' && token) {
			window.sessionStorage.setItem('auth_token', token);
		} else {
			window.sessionStorage.removeItem('auth_token');
		}
	}

	if (browser) {
		syncToken();
	}

	$effect(() => {
		syncToken();
	});
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

{@render children()}

{#if dev}
	{#await import('$lib/components/DevPersonaSwitcher.svelte') then { default: DevPersonaSwitcher }}
		<DevPersonaSwitcher session={data.session as unknown as Record<string, unknown> | null} />
	{/await}
{/if}
