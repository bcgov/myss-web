/**
 * Mock auth handle for local development.
 *
 * When MOCK_AUTH=true, this replaces the real Auth.js handle so the app
 * can be used without configuring OIDC providers.
 *
 * The active persona is determined by (in priority order):
 *   1. The `mock_persona` cookie — set by the DevPersonaSwitcher toolbar
 *   2. The MOCK_AUTH_PERSONA env var — default at server start
 *   3. Falls back to 'alice'
 *
 * Persona JWT tokens are read from MOCK_AUTH_TOKEN_ALICE, _BOB, _CAROL,
 * _WORKER env vars (paste seeder output into .env).
 *
 * This module refuses to load outside of dev mode as a safety guard.
 */
import { dev } from '$app/environment';
import {
	MOCK_AUTH_TOKEN_ALICE,
	MOCK_AUTH_TOKEN_BOB,
	MOCK_AUTH_TOKEN_CAROL,
	MOCK_AUTH_TOKEN_WORKER,
	MOCK_AUTH_PERSONA,
	MOCK_AUTH_USER,
} from '$env/static/private';
import type { Handle, RequestEvent } from '@sveltejs/kit';

if (!dev) {
	throw new Error('mock-auth must not be imported outside of dev mode');
}

type Persona = 'alice' | 'bob' | 'carol' | 'worker';

const VALID_PERSONAS: readonly Persona[] = ['alice', 'bob', 'carol', 'worker'];

const PERSONA_TOKENS: Record<Persona, string> = {
	alice: MOCK_AUTH_TOKEN_ALICE || 'missing-token-alice',
	bob: MOCK_AUTH_TOKEN_BOB || 'missing-token-bob',
	carol: MOCK_AUTH_TOKEN_CAROL || 'missing-token-carol',
	worker: MOCK_AUTH_TOKEN_WORKER || 'missing-token-worker',
};

const PERSONA_DISPLAY: Record<Persona, string> = {
	alice: 'Alice Thompson',
	bob: 'Bob Chen',
	carol: 'Carol Williams',
	worker: MOCK_AUTH_USER || 'Dev Worker',
};

function getActivePersona(event: RequestEvent): Persona {
	const fromCookie = event.cookies.get('mock_persona');
	if (fromCookie && VALID_PERSONAS.includes(fromCookie as Persona)) {
		return fromCookie as Persona;
	}
	const fromEnv = MOCK_AUTH_PERSONA?.toLowerCase();
	if (fromEnv && VALID_PERSONAS.includes(fromEnv as Persona)) {
		return fromEnv as Persona;
	}
	return 'alice';
}

export const handle: Handle = async ({ event, resolve }) => {
	const persona = getActivePersona(event);
	const isWorker = persona === 'worker';

	const token = PERSONA_TOKENS[persona];
	console.log(`[mock-auth] persona=${persona} token=${token.substring(0, 20)}...`);

	const mockSession = {
		user: {
			name: PERSONA_DISPLAY[persona],
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
