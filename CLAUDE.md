# CLAUDE.md

This file provides guidance to Claude Code when working with this repository.

## Project Overview

myss-web is a SvelteKit 2 frontend (Svelte 5, TypeScript) for BC Government's MySelfServe income assistance self-service portal. It communicates with a FastAPI backend (separate repo: myss-api) for all data operations.

## Build and Development Commands

```bash
# Install dependencies
npm install

# Start dev server (default: http://localhost:5173)
npm run dev

# Type check
npm run check

# Unit tests
npm test

# Unit tests in watch mode
npm run test:watch

# End-to-end tests
npm run test:e2e

# Production build
npm run build
npm run preview
```

## Architecture

### SvelteKit File-Based Routing

Routes in `src/routes/` follow SvelteKit conventions:
- `+page.svelte` — page component
- `+page.server.ts` — server-side load function (data fetching from API)
- `+layout.svelte` — shared layout
- `+server.ts` — API route handlers (proxying, form actions)

### Route Groups

- `(auth)/` — protected routes requiring BCeID login
  - `account/`, `messages/`, `monthly-reports/`, `payment/`, `service-requests/`
- `admin/` — worker routes requiring IDIR login
  - `support-view/`, `ao/` (admin override)
- `registration/` — public multi-step registration wizard
- `eligibility/` — public eligibility estimator

### Authentication

- **Auth.js** (`@auth/sveltekit`) handles BCeID and IDIR authentication
- Server hooks in `hooks.server.ts` enforce auth on protected route groups
- JWT tokens passed to myss-api via `Authorization: Bearer` header

### Svelte 5 Conventions

This project uses **Svelte 5 runes syntax**:
- `$state()` for reactive state (not `writable()` stores)
- `$derived()` for computed values
- `$effect()` for side effects
- `$props()` for component props (not `export let`)
- `$bindable()` for two-way binding props

### API Communication

All API calls go through the myss-api backend. The frontend never directly contacts Siebel/ICM.

- API base URL configured via environment variable
- Server-side load functions call the API with the user's JWT
- Error responses from the API are translated to user-friendly messages

### Eligibility Estimator

`eligibility-estimator/` is a standalone Svelte 4 + Vite app that runs the anonymous eligibility calculator. It's embedded in the main application and can also be deployed independently.

## Code Conventions

- **Components**: PascalCase filenames, Svelte 5 runes syntax
- **Routes**: kebab-case directory names matching URL paths
- **Types**: TypeScript interfaces in `*.ts` files alongside components
- **Tests**: Vitest for unit tests, Playwright for E2E
- **Styling**: Scoped `<style>` blocks in Svelte components

## Environment Variables

| Variable | Required | Default | Description |
|---|---|---|---|
| `PUBLIC_API_URL` | Yes | `http://localhost:8000` | myss-api base URL |
| `AUTH_SECRET` | Prod only | — | Auth.js session secret |
| `AUTH_BCEID_CLIENT_ID` | Prod only | — | BCeID OAuth client ID |
| `AUTH_BCEID_CLIENT_SECRET` | Prod only | — | BCeID OAuth client secret |
| `AUTH_IDIR_CLIENT_ID` | Prod only | — | IDIR OAuth client ID |
| `AUTH_IDIR_CLIENT_SECRET` | Prod only | — | IDIR OAuth client secret |
