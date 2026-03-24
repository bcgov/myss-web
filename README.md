# myss-web

SvelteKit frontend for the BC Government MySelfServe income assistance self-service portal.

## Tech Stack

- **SvelteKit 2** + **Svelte 5** (runes syntax) — full-stack web framework
- **TypeScript** — type safety
- **Auth.js / @auth/sveltekit** — BCeID and IDIR authentication
- **Vite 7** — build tooling
- **Vitest** — unit testing
- **Playwright** — end-to-end testing

## Quick Start

```bash
# Install dependencies
npm install

# Start the development server
npm run dev

# Open in browser
npm run dev -- --open
```

The frontend expects the API server running at `http://localhost:8000` (configurable via environment variables).

## Testing

```bash
# Unit tests
npm test

# Unit tests in watch mode
npm run test:watch

# Type checking
npm run check

# End-to-end tests (requires running API)
npm run test:e2e
```

## Project Structure

```
src/
├── lib/            # Shared utilities, components, API client
├── routes/         # SvelteKit file-based routing
│   ├── (auth)/     # Protected routes (requires login)
│   │   ├── account/
│   │   ├── messages/
│   │   ├── monthly-reports/
│   │   ├── payment/
│   │   └── service-requests/
│   ├── admin/      # Worker/admin routes (IDIR auth)
│   ├── eligibility/
│   └── registration/
├── app.html        # HTML shell
└── hooks.server.ts # Server hooks (auth, session)

eligibility-estimator/   # Standalone eligibility calculator (Svelte 4 + Vite)
e2e/                     # Playwright end-to-end tests
static/                  # Static assets
```

## Deployment

Container image built from `Dockerfile`. Deployed to OpenShift via manifests in `openshift/`.

See `docs/ops/` for deployment runbooks and infrastructure setup guides.

## Related Repository

- **myss-api** — FastAPI backend ([../myss-api](../myss-api))
