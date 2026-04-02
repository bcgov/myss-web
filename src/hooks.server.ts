import { dev } from '$app/environment';
import { env } from '$env/dynamic/private';
import { sequence } from '@sveltejs/kit/hooks';
import type { Handle } from '@sveltejs/kit';
import { v4 as uuidv4 } from 'uuid';

const useMockAuth = dev && env.MOCK_AUTH === 'true';

let authHandle: Handle;
if (useMockAuth) {
    const mock = await import('$lib/server/mock-auth');
    authHandle = mock.handle;
    console.log('[dev] Mock auth enabled — skipping OIDC, using fake session');
} else {
    const auth = await import('$lib/server/auth');
    authHandle = auth.handle;
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
