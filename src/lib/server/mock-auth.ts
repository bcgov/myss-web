/**
 * Mock auth handle for development and test environments.
 *
 * When all three safety locks are set (see mock-auth-gate.ts), this
 * replaces the real Auth.js handle so the app can be used without
 * configuring OIDC providers.
 *
 * The active persona is determined by (in priority order):
 *   1. The `mock_persona` cookie — set by the DevPersonaSwitcher toolbar
 *   2. The MOCK_AUTH_PERSONA env var — default at server start
 *   3. Falls back to 'alice'
 *
 * Persona JWT tokens are read from MOCK_AUTH_TOKEN_ALICE, _BOB, _CAROL,
 * _WORKER env vars at runtime (not build time, so they can be provided
 * via Kubernetes Secret).
 */
import { env } from '$env/dynamic/private';
import type { Handle, RequestEvent } from '@sveltejs/kit';
import { isMockAuthAllowed } from './mock-auth-gate';

type Persona = 'alice' | 'bob' | 'carol' | 'worker';

const VALID_PERSONAS: readonly Persona[] = ['alice', 'bob', 'carol', 'worker'];

function getPersonaTokens() {
	return {
		alice: env.MOCK_AUTH_TOKEN_ALICE || 'missing-token-alice',
		bob: env.MOCK_AUTH_TOKEN_BOB || 'missing-token-bob',
		carol: env.MOCK_AUTH_TOKEN_CAROL || 'missing-token-carol',
		worker: env.MOCK_AUTH_TOKEN_WORKER || 'missing-token-worker',
	} as const satisfies Record<Persona, string>;
}

function getPersonaDisplay() {
	return {
		alice: 'Alice Thompson',
		bob: 'Bob Chen',
		carol: 'Carol Williams',
		worker: env.MOCK_AUTH_USER || 'Dev Worker',
	} as const satisfies Record<Persona, string>;
}

function getActivePersona(event: RequestEvent): Persona {
	const fromCookie = event.cookies.get('mock_persona');
	if (fromCookie && VALID_PERSONAS.includes(fromCookie as Persona)) {
		return fromCookie as Persona;
	}
	const fromEnv = env.MOCK_AUTH_PERSONA?.toLowerCase();
	if (fromEnv && VALID_PERSONAS.includes(fromEnv as Persona)) {
		return fromEnv as Persona;
	}
	return 'alice';
}

// Belt-and-braces: refuse to load if the gate isn't satisfied.
// hooks.server.ts checks the gate before importing this module, so in
// practice this should never trip unless env changes between checks.
const gate = isMockAuthAllowed(env as Record<string, string | undefined>);
if (!gate.enabled) {
	throw new Error(`mock-auth loaded without safety gate satisfied: ${gate.reason}`);
}

export const handle: Handle = async ({ event, resolve }) => {
	const persona = getActivePersona(event);
	const isWorker = persona === 'worker';
	const tokens = getPersonaTokens();
	const displays = getPersonaDisplay();

	const token = tokens[persona];
	console.log(`[mock-auth] persona=${persona} token=${token.substring(0, 20)}...`);

	const mockSession = {
		user: {
			name: displays[persona],
			email: `${persona}@localhost`,
		},
		expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
		accessToken: token,
		provider: isWorker ? 'idir' : 'bceid',
		idir_username: isWorker ? 'jsmith' : undefined,
	};

	event.locals.auth = async () => mockSession;
	return resolve(event);
};
