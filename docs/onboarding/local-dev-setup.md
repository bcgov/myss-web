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

# Mock auth — bypass OIDC login using one of four seeded personas.
# All three of these must be set for mock auth to activate
# (the runtime safety gate refuses otherwise; see "Mock authentication" below).
PUBLIC_ENVIRONMENT_NAME=DEV1
PUBLIC_ALLOW_MOCK_AUTH=true
MOCK_AUTH=true

# Starting persona — DevPersonaSwitcher toolbar lets you change at runtime.
MOCK_AUTH_PERSONA=alice

# Persona JWTs (paste from `python scripts/seed_db.py` in myss-api).
MOCK_AUTH_TOKEN_ALICE=
MOCK_AUTH_TOKEN_BOB=
MOCK_AUTH_TOKEN_CAROL=
MOCK_AUTH_TOKEN_WORKER=

# Keycloak / BCeID OIDC (only needed if mock auth is NOT active)
AUTH_KEYCLOAK_ID=myss-web
AUTH_KEYCLOAK_SECRET=
AUTH_KEYCLOAK_ISSUER=https://keycloak.example.gov.bc.ca/realms/myss
```

**`AUTH_SECRET`** must be set to any non-empty string. Auth.js uses it to encrypt session cookies. In production, use a strong random value (at least 32 characters).

### Mock authentication (recommended for local dev and OpenShift test deploys)

Mock auth bypasses Auth.js OIDC entirely and injects a fake authenticated session keyed by a persona JWT signed by the myss-api seeder. It works in both `npm run dev` and production builds (`node build`) — the frontend's runtime safety gate decides whether to activate.

**Three locks must all be set** for mock auth to turn on (see `src/lib/server/mock-auth-gate.ts`):

| Lock | Value | Purpose |
|---|---|---|
| `PUBLIC_ALLOW_MOCK_AUTH` | `"true"` | Explicit opt-in. |
| `PUBLIC_ENVIRONMENT_NAME` | any non-prod name (e.g. `DEV1`, `TEST`) | Refuses to activate when the environment name is `PROD`, `PRD`, or `PRODUCTION` (case-insensitive). |
| `MOCK_AUTH` | `"true"` | The activation switch. |

If any lock is missing or wrong, the server logs `[auth] real Auth.js active — mock gate closed: <reason>` on startup and falls back to real OIDC.

**Populating the persona tokens.** In the myss-api repo, run `python scripts/seed_db.py` — it prints a block labelled `myss-web .env (paste into myss-web/.env):`. Copy those four `MOCK_AUTH_TOKEN_*` lines into your `.env`. Tokens default to 1-day expiry; set `SEED_TOKEN_TTL_DAYS=90` when running the seeder if you want longer-lived tokens.

**Switching personas at runtime.** When mock auth is active, a floating `DevPersonaSwitcher` toolbar appears in the bottom-right of every page. Click to swap between Alice, Bob, Carol, and Worker — the toolbar writes a `mock_persona` cookie that the server consults on every request.

To disable mock auth and use real OIDC login, remove any one of the three locks (easiest: set `MOCK_AUTH=` empty).

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
