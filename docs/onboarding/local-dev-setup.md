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
TRUST_HOST=true

# Mock auth — bypass OIDC login for local development
MOCK_AUTH=true
# MOCK_AUTH_ROLE=CLIENT   # CLIENT (default), WORKER, or ADMIN
# MOCK_AUTH_USER=Dev User # Display name for the mock session

# Keycloak / BCeID OIDC (only needed if MOCK_AUTH is not true)
AUTH_KEYCLOAK_ID=myss-web
AUTH_KEYCLOAK_SECRET=
AUTH_KEYCLOAK_ISSUER=https://keycloak.example.gov.bc.ca/realms/myss
```

**`AUTH_SECRET`** must be set to any non-empty string. Auth.js uses it to encrypt session cookies. In production, use a strong random value (at least 32 characters).

### Mock authentication (recommended for local dev)

Setting **`MOCK_AUTH=true`** bypasses Auth.js OIDC entirely and injects a fake authenticated session. This means you can browse all protected routes without configuring BCeID or IDIR providers. The mock is implemented in `src/lib/server/mock-auth.ts` and is guarded by SvelteKit's `dev` flag — it refuses to load in production builds.

You can control the mock session with two optional variables:

| Variable | Default | Effect |
|---|---|---|
| `MOCK_AUTH_ROLE` | `CLIENT` | Sets the session role. Use `WORKER` or `ADMIN` to test worker/admin routes. |
| `MOCK_AUTH_USER` | `Dev User` | Display name shown in the UI greeting. |

To test as a worker, for example:

```dotenv
MOCK_AUTH=true
MOCK_AUTH_ROLE=WORKER
MOCK_AUTH_USER=Test Worker
```

To disable mock auth and use real OIDC login, either remove `MOCK_AUTH` or set it to any value other than `true`.

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
If `MOCK_AUTH=true`, this error should not occur (Auth.js is bypassed). If you are using real OIDC login (`MOCK_AUTH` unset), Auth.js in dev mode automatically trusts localhost — ensure you are running via `npm run dev` and not a production build.

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
