import { env } from '$env/dynamic/private';
import { sequence } from '@sveltejs/kit/hooks';
import type { Handle } from '@sveltejs/kit';
import { v4 as uuidv4 } from 'uuid';
import { isMockAuthAllowed } from '$lib/server/mock-auth-gate';

const mockGate = isMockAuthAllowed(env as Record<string, string | undefined>);

let authHandle: Handle;
if (mockGate.enabled) {
	const mock = await import('$lib/server/mock-auth');
	authHandle = mock.handle;
	console.log(`[auth] mock-auth active: ${mockGate.reason}`);
} else {
	const auth = await import('$lib/server/auth');
	authHandle = auth.handle;
	console.log(`[auth] real Auth.js active — mock gate closed: ${mockGate.reason}`);
}

export const handle: Handle = sequence(
	authHandle,
	async ({ event, resolve }) => {
		const id = event.request.headers.get('x-request-id') ?? uuidv4();
		event.locals.requestId = id;
		event.setHeaders({ 'X-Request-ID': id });
		return resolve(event);
	}
);
