# Local Development Setup

Get a working myss-web development environment from zero.

## Prerequisites

| Tool | Required version | Notes |
|---|---|---|
| Node.js | 20 LTS | `node --version` |
| myss-api | running locally | Backend API on port 8000 (see [myss-api setup](https://github.com/your-org/myss-api)) |

## Clone and Install

```bash
git clone <repo-url> myss-web
cd myss-web
npm install
```

## Environment Variables

Create a `.env` file in the project root:

```dotenv
# Points to the FastAPI backend
PUBLIC_API_URL=http://localhost:8000

# Auth.js — required for local development
AUTH_SECRET=local-dev-secret
AUTH_TRUST_HOST=true

# Keycloak / BCeID OIDC (set to real values for login to work)
AUTH_KEYCLOAK_ID=myss-web
AUTH_KEYCLOAK_SECRET=
AUTH_KEYCLOAK_ISSUER=https://keycloak.example.gov.bc.ca/realms/myss
```

**`AUTH_TRUST_HOST=true`** is required for local development. Auth.js rejects requests from `localhost` by default as an untrusted host. In production this is not needed because `AUTH_URL` is set to the real domain. Without this setting you will see `UntrustedHost` errors and 500s on every page load.

**`AUTH_SECRET`** must be set to any non-empty string. Auth.js uses it to encrypt session cookies. In production, use a strong random value (at least 32 characters).

## Start the Dev Server

```bash
npm run dev
```

SvelteKit's dev server starts on port 5173 (Vite default). Make sure the myss-api backend is running on port 8000 before starting the frontend.

To open the browser automatically:

```bash
npm run dev -- --open
```

## Verify

| Check | URL |
|---|---|
| SvelteKit home page | http://localhost:5173 |
| API health (backend) | http://localhost:8000/health |

If the home page loads without errors, Auth.js is configured correctly and the frontend can reach the API.

## Running Tests

```bash
# Unit tests
npm test

# Unit tests in watch mode
npm run test:watch

# Type checking
npm run check

# End-to-end tests (requires running API + frontend)
npm run test:e2e
```

## Eligibility Estimator

The `eligibility-estimator/` directory is a standalone Svelte 4 + Vite app. To run it independently:

```bash
cd eligibility-estimator
npm install
npm run dev
```

## Common Issues

**`UntrustedHost: Host must be trusted` (500 error on every page)**
Your `.env` is missing `AUTH_TRUST_HOST=true`. Auth.js rejects `localhost` as untrusted by default. Add this variable and restart the dev server.

**`AUTH_SECRET` error on startup**
`AUTH_SECRET` must be set in your `.env`. Any non-empty string works for local development.

**`CORS` errors in the browser console**
The myss-api backend must have `http://localhost:5173` in its `CORS_ALLOWED_ORIGINS` environment variable. Note: this only affects browser-originated requests. SvelteKit server-side fetches in `+page.server.ts` are not subject to CORS.

**`fetch failed` or `ECONNREFUSED` on API calls**
The myss-api backend is not running on port 8000. Start it with `uvicorn app.main:app --reload --port 8000` in the myss-api repo.

**Vitest or Playwright not found**
Run `npm install` in the project root. If you see version conflicts, delete `node_modules/` and `package-lock.json` and run `npm install` again.

**Svelte component type errors after pulling changes**
Run `npm run prepare` to regenerate SvelteKit type definitions, then `npm run check` to verify.
