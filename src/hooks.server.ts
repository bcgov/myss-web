import { handle as authHandle } from '$lib/server/auth';
import { sequence } from '@sveltejs/kit/hooks';
import type { Handle } from '@sveltejs/kit';
import { v4 as uuidv4 } from 'uuid';

export const handle: Handle = sequence(
    authHandle,
    async ({ event, resolve }) => {
        const id = event.request.headers.get('x-request-id') ?? uuidv4();
        event.locals.requestId = id;
        event.setHeaders({ 'X-Request-ID': id });
        return resolve(event);
    }
);
