<script lang="ts">
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	let session = $derived(data.session);
	let loggedIn = $derived(!!session?.user);
</script>

<svelte:head>
	<title>MySelfServe — BC Income Assistance</title>
</svelte:head>

<main class="home">
	<h1>MySelfServe</h1>
	<p class="subtitle">BC Income Assistance Self-Service Portal</p>

	{#if loggedIn}
		<p class="greeting">Welcome back, {session?.user?.name ?? 'User'}.</p>

		<nav class="dashboard-grid" aria-label="Dashboard">
			<a href="/messages" class="card">
				<h2>Messages</h2>
				<p>View messages from your worker.</p>
			</a>
			<a href="/service-requests" class="card">
				<h2>Service Requests</h2>
				<p>Submit or track service requests.</p>
			</a>
			<a href="/monthly-report" class="card">
				<h2>Monthly Report</h2>
				<p>Complete your monthly income report.</p>
			</a>
			<a href="/payment-info" class="card">
				<h2>Payment Info</h2>
				<p>View recent payments and benefit details.</p>
			</a>
			<a href="/employment-plans" class="card">
				<h2>Employment Plans</h2>
				<p>View your employment plan.</p>
			</a>
			<a href="/account" class="card">
				<h2>My Account</h2>
				<p>Manage your contact information and PIN.</p>
			</a>
		</nav>
	{:else}
		<div class="guest-actions">
			<p>Sign in with your BCeID to access your income assistance account.</p>

			<div class="button-group">
				<a href="/auth/signin" class="btn btn-primary">Sign in with BCeID</a>
				<a href="/registration" class="btn btn-secondary">Create an Account</a>
			</div>
		</div>
	{/if}
</main>

<style>
	.home {
		max-width: 800px;
		margin: 2rem auto;
		padding: 0 1rem;
		font-family: 'BC Sans', Arial, sans-serif;
	}

	h1 {
		font-size: 2rem;
		color: #003366;
		margin-bottom: 0.25rem;
	}

	.subtitle {
		color: #555;
		font-size: 1.1rem;
		margin-bottom: 2rem;
	}

	.greeting {
		font-size: 1.05rem;
		margin-bottom: 1.5rem;
	}

	/* Dashboard card grid */
	.dashboard-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
		gap: 1rem;
	}

	.card {
		display: block;
		background: #f0f4f8;
		border: 1px solid #c6d4e3;
		border-radius: 6px;
		padding: 1.25rem;
		text-decoration: none;
		color: inherit;
		transition: border-color 0.15s, box-shadow 0.15s;
	}

	.card:hover,
	.card:focus-visible {
		border-color: #003366;
		box-shadow: 0 2px 6px rgba(0, 51, 102, 0.15);
	}

	.card h2 {
		font-size: 1.1rem;
		color: #003366;
		margin: 0 0 0.4rem;
	}

	.card p {
		font-size: 0.9rem;
		color: #555;
		margin: 0;
	}

	/* Guest actions */
	.guest-actions {
		margin-top: 1rem;
	}

	.guest-actions p {
		font-size: 1.05rem;
		margin-bottom: 1.5rem;
	}

	.button-group {
		display: flex;
		gap: 1rem;
		flex-wrap: wrap;
	}

	.btn {
		display: inline-block;
		padding: 0.7rem 1.5rem;
		border-radius: 4px;
		font-size: 1rem;
		font-family: inherit;
		text-decoration: none;
		text-align: center;
		cursor: pointer;
	}

	.btn-primary {
		background: #003366;
		color: #fff;
		border: 1px solid #003366;
	}

	.btn-primary:hover {
		background: #002244;
	}

	.btn-secondary {
		background: #fff;
		color: #003366;
		border: 1px solid #003366;
	}

	.btn-secondary:hover {
		background: #f0f4f8;
	}
</style>
