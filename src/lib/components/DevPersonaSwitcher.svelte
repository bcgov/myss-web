<script lang="ts">
	/**
	 * DevPersonaSwitcher — dev-only floating toolbar for switching test personas.
	 *
	 * Rendered only when `dev` is true (dynamically imported in +layout.svelte).
	 * Vite tree-shakes this component entirely from production builds.
	 *
	 * Mechanism:
	 *   1. Sets a `mock_persona` cookie to the chosen persona name
	 *   2. Clears sessionStorage so stale tokens don't persist across the reload
	 *   3. Reloads the page so hooks.server.ts rebuilds the session from the cookie
	 */
	import { dev } from '$app/environment';

	if (!dev) {
		throw new Error('DevPersonaSwitcher must not be rendered outside of dev mode');
	}

	interface Persona {
		key: string;
		label: string;
		detail: string;
	}

	const PERSONAS: Persona[] = [
		{ key: 'alice', label: 'Alice', detail: 'Single client, active case' },
		{ key: 'bob', label: 'Bob', detail: 'Couple, PWD, pending EP' },
		{ key: 'carol', label: 'Carol', detail: 'Closed case, unlinked' },
		{ key: 'worker', label: 'Worker', detail: 'IDIR admin' },
	];

	let { session }: { session: Record<string, unknown> | null } = $props();

	function getActiveCookie(): string {
		if (typeof document === 'undefined') return '';
		const match = document.cookie.match(/(?:^|;\s*)mock_persona=([^;]*)/);
		return match ? decodeURIComponent(match[1]) : '';
	}

	let active = $state(getActiveCookie());
	let collapsed = $state(true);

	function switchPersona(key: string) {
		document.cookie = 'mock_persona=; path=/; max-age=0';
		document.cookie = `mock_persona=${encodeURIComponent(key)}; path=/; max-age=86400; SameSite=Strict`;
		window.sessionStorage.removeItem('auth_token');
		window.location.reload();
	}

	let sessionName = $derived(
		(session as { user?: { name?: string } } | null)?.user?.name ?? 'no session',
	);

	let hasToken = $derived((() => {
		const token = (session as Record<string, unknown> | null)?.accessToken;
		return typeof token === 'string' && token !== '' && !token.startsWith('missing-token-');
	})());
</script>

<div class="persona-switcher" class:collapsed>
	<button
		class="toggle"
		onclick={() => (collapsed = !collapsed)}
		aria-label="Toggle persona switcher"
	>
		{collapsed ? '\u{1F464}' : '\u{2715}'}
	</button>

	{#if !collapsed}
		<div class="panel">
			<div class="header">
				<span class="title">Dev Personas</span>
				<span class="current">{sessionName}</span>
			</div>

			{#if !hasToken}
				<div class="warning">
					Token missing — run the seeder and paste output into <code>.env</code>
				</div>
			{/if}

			<div class="buttons">
				{#each PERSONAS as persona (persona.key)}
					<button
						class="persona-btn"
						class:active={active === persona.key}
						onclick={() => switchPersona(persona.key)}
					>
						<span class="persona-label">{persona.label}</span>
						<span class="persona-detail">{persona.detail}</span>
					</button>
				{/each}
			</div>

			<div class="footer">MOCK_AUTH &middot; dev only</div>
		</div>
	{/if}
</div>

<style>
	.persona-switcher {
		position: fixed;
		bottom: 1.25rem;
		right: 1.25rem;
		z-index: 9999;
		font-family: 'BC Sans', Arial, sans-serif;
		font-size: 0.8rem;
	}

	.toggle {
		position: absolute;
		bottom: 0;
		right: 0;
		width: 2.5rem;
		height: 2.5rem;
		border-radius: 50%;
		background: #1a1a2e;
		color: #fff;
		border: 2px solid #4a4a7a;
		cursor: pointer;
		font-size: 1rem;
		display: flex;
		align-items: center;
		justify-content: center;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
		transition: background 0.15s;
	}

	.toggle:hover {
		background: #2a2a4e;
	}

	.panel {
		background: #1a1a2e;
		border: 1px solid #4a4a7a;
		border-radius: 8px;
		padding: 0.75rem;
		margin-bottom: 3rem;
		min-width: 220px;
		box-shadow: 0 4px 16px rgba(0, 0, 0, 0.4);
		color: #ccccdd;
	}

	.header {
		display: flex;
		justify-content: space-between;
		align-items: baseline;
		margin-bottom: 0.5rem;
	}

	.title {
		font-weight: 700;
		color: #8888cc;
		font-size: 0.7rem;
		text-transform: uppercase;
		letter-spacing: 0.08em;
	}

	.current {
		color: #888;
		font-size: 0.7rem;
		max-width: 120px;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.warning {
		background: #3a2a00;
		border: 1px solid #886600;
		border-radius: 4px;
		padding: 0.4rem 0.5rem;
		margin-bottom: 0.5rem;
		font-size: 0.7rem;
		color: #ffcc44;
	}

	.warning code {
		background: rgba(255, 255, 255, 0.1);
		padding: 0.1rem 0.3rem;
		border-radius: 2px;
		font-size: 0.7rem;
	}

	.buttons {
		display: flex;
		flex-direction: column;
		gap: 0.3rem;
	}

	.persona-btn {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 0.4rem 0.6rem;
		border: 1px solid #4a4a7a;
		border-radius: 4px;
		background: transparent;
		cursor: pointer;
		text-align: left;
		font-family: inherit;
		font-size: 0.8rem;
		color: #ccccdd;
		transition:
			background 0.15s,
			border-color 0.15s;
	}

	.persona-btn:hover {
		background: #2a2a4e;
		border-color: #6666aa;
	}

	.persona-btn.active {
		background: #003366;
		color: #fff;
		border-color: #3399ff;
		font-weight: 600;
	}

	.persona-detail {
		font-size: 0.65rem;
		opacity: 0.6;
		margin-left: 0.75rem;
		white-space: nowrap;
	}

	.persona-btn.active .persona-detail {
		opacity: 0.8;
	}

	.footer {
		margin-top: 0.5rem;
		color: #555;
		font-size: 0.65rem;
		text-align: center;
	}
</style>
