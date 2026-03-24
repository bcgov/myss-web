# Adding a New UI Page

## When to use this guide

Use this guide when a new user-facing page is needed — a new route in the SvelteKit frontend, such as a new section of the portal, a new step in a flow, or a new admin screen.

## Prerequisites

- [Local development setup](../onboarding/local-dev-setup.md)
- [Codebase overview](../onboarding/architecture.md)
- The API endpoint for the page's data already exists (see [Adding an API Endpoint](./adding-api-endpoint.md))

---

## Steps

### 1. Create the route directory under `src/routes/`

SvelteKit uses file-based routing. The directory structure under `myss-web/src/routes/` maps directly to URLs:

```
src/routes/
├── +layout.svelte          → wraps all pages
├── +layout.server.ts       → runs on every request (loads session)
├── +page.svelte            → /
├── account/
│   └── +page.svelte        → /account
├── service-requests/
│   ├── +page.svelte        → /service-requests
│   ├── new/
│   │   └── +page.svelte    → /service-requests/new
│   └── [id]/
│       └── +page.svelte    → /service-requests/:id
```

Create your new directory:

```bash
mkdir -p myss-web/src/routes/your-section
```

For dynamic routes (e.g. `/your-section/:id`), use square brackets: `src/routes/your-section/[id]/`.

### 2. Write `+page.server.ts` — server-side load and auth guard

The `+page.server.ts` file runs on the server before the page renders. Use it to check authentication and fetch initial data.

The layout already loads the session in `src/routes/+layout.server.ts`:
```typescript
export const load: LayoutServerLoad = async (event) => {
    return {
        session: await event.locals.auth?.(),
    };
};
```

Your page's server load function receives the parent data and can extend it:

```typescript
// src/routes/your-section/+page.server.ts
import { redirect } from '@sveltejs/kit';
import { API_BASE_URL } from '$lib/api/client';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async (event) => {
    // Auth guard — redirect unauthenticated users to login
    const session = await event.locals.auth?.();
    if (!session?.user) {
        throw redirect(302, '/login');
    }

    // Fetch data from the API using the session token
    const token = session.accessToken as string;
    const response = await fetch(`${API_BASE_URL}/your-resource`, {
        headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) {
        // Let the page handle the error state, or throw an error page:
        return { items: [], error: `API error: ${response.status}` };
    }

    const data = await response.json();
    return { items: data.items, total: data.total };
};
```

`API_BASE_URL` comes from `myss-web/src/lib/api/client.ts`:
```typescript
export const API_BASE_URL =
    (typeof import.meta !== 'undefined' && import.meta.env?.PUBLIC_API_BASE_URL) ??
    'http://localhost:8000';
```

It reads `PUBLIC_API_BASE_URL` from the environment at build time, falling back to `http://localhost:8000` for local development.

### 3. Write `+page.svelte` — the page component

`+page.svelte` receives the data returned from `+page.server.ts` via `$props()`. This is the Svelte 5 runes pattern used throughout the codebase (as seen in `+layout.svelte`):

```svelte
<script lang="ts">
    import type { PageData } from './$types';

    let { data }: { data: PageData } = $props();
    // data.items and data.total are the values returned by load()
</script>

<svelte:head>
    <title>Your Section</title>
</svelte:head>

<main>
    <h1>Your Section</h1>

    {#if data.error}
        <div class="error" role="alert">
            <p>{data.error}</p>
        </div>
    {:else if data.items.length === 0}
        <p>No items found.</p>
    {:else}
        <ul>
            {#each data.items as item (item.id)}
                <li>{item.name}</li>
            {/each}
        </ul>
    {/if}
</main>
```

Key points for the Svelte 5 pattern:

- Use `let { data } = $props()` — not `export let data` (that was Svelte 4)
- `data` is typed by `PageData` generated from your `+page.server.ts` return type
- `{#each items as item (item.id)}` — always provide a key for list rendering

For client-side interactions that happen after the initial load (pagination, form submission), call the API directly from event handlers, as seen in `service-requests/+page.svelte`:

```svelte
<script lang="ts">
    import { API_BASE_URL } from '$lib/api/client';

    let { data } = $props();
    let items = $state(data.items);
    let loading = $state(false);

    async function loadMore() {
        loading = true;
        const res = await fetch(`${API_BASE_URL}/your-resource?page=2`, {
            headers: { Authorization: `Bearer ${getToken()}` },
        });
        const more = await res.json();
        items = [...items, ...more.items];
        loading = false;
    }
</script>
```

### 4. Add a navigation link

If the page should appear in the main navigation, add a link in the appropriate layout or navigation component. Check `myss-web/src/lib/components/` for an existing nav component, or add the link directly to `+layout.svelte`:

```svelte
<nav>
    <a href="/your-section">Your Section</a>
</nav>
```

For protected pages, only render the link when the user is authenticated (check `data.session?.user`).

### 5. Write Vitest and Playwright tests

**Unit test the load function** with Vitest by mocking `fetch` and `event.locals.auth`:

```typescript
// myss-web/src/routes/your-section/+page.server.test.ts
import { describe, it, expect, vi } from 'vitest';
import { load } from './+page.server';

describe('your-section load', () => {
    it('redirects unauthenticated users', async () => {
        const event = { locals: { auth: async () => null } } as any;
        await expect(load(event)).rejects.toMatchObject({ status: 302 });
    });

    it('returns items when API responds 200', async () => {
        const mockItems = [{ id: '1', name: 'Test' }];
        global.fetch = vi.fn().mockResolvedValue({
            ok: true,
            json: async () => ({ items: mockItems, total: 1 }),
        });
        const event = {
            locals: { auth: async () => ({ user: { name: 'Test' }, accessToken: 'tok' }) },
        } as any;
        const result = await load(event);
        expect(result.items).toEqual(mockItems);
    });
});
```

**End-to-end test** with Playwright:

```typescript
// myss-web/tests/your-section.spec.ts
import { test, expect } from '@playwright/test';

test('unauthenticated user is redirected to login', async ({ page }) => {
    await page.goto('/your-section');
    await expect(page).toHaveURL(/\/login/);
});

test('authenticated user sees page heading', async ({ page }) => {
    // Set up auth state (see existing e2e fixtures)
    await page.goto('/your-section');
    await expect(page.getByRole('heading', { name: 'Your Section' })).toBeVisible();
});
```

---

## Verification

```bash
cd myss-web

# Run unit tests
npm test

# Start dev server and navigate
npm run dev
# Open: http://localhost:5173/your-section

# Run Playwright e2e tests
npm run test:e2e
```

---

## Common pitfalls

**Missing auth guard in `+page.server.ts`**
Without checking `session?.user` and throwing a `redirect`, unauthenticated users will reach the page and see API 401 errors. Always guard protected pages at the server load level.

**Not handling loading and error states**
The initial data comes from `+page.server.ts`, but any client-side fetching needs its own loading and error state variables. The `service-requests/+page.svelte` shows the full pattern: `loading`, `error`, and `loadingMore` states with appropriate template branches.

**SSR fetch using browser-only APIs**
`+page.server.ts` runs on the server — `window`, `sessionStorage`, and `localStorage` are not available there. Use `event.locals.auth()` for the token in server load functions. Only access browser APIs inside `onMount()` or event handlers in `+page.svelte`.

**Using Svelte 4 `export let data` syntax**
The codebase uses Svelte 5 runes. Use `let { data } = $props()` for props and `let count = $state(0)` for reactive local state. Using `export let` or `$: reactiveVar` will cause warnings and may not behave as expected.

**Forgetting `(key)` in `{#each}` loops**
Without a key, Svelte cannot efficiently update list items. Always provide a unique key: `{#each items as item (item.id)}`.
