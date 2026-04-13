// src/routes/admin/+layout.server.ts
import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';

function isIdirSession(
    session: unknown
): session is { user: unknown; provider: 'idir'; idir_username: string } {
    return (
        typeof session === 'object' &&
        session !== null &&
        'user' in session &&
        (session as Record<string, unknown>).user != null &&
        'provider' in session &&
        (session as Record<string, unknown>).provider === 'idir' &&
        'idir_username' in session &&
        typeof (session as Record<string, unknown>).idir_username === 'string'
    );
}

export const load: LayoutServerLoad = async (event) => {
    const session = await event.locals.auth?.();
    // Admin routes require IDIR authentication with a valid idir_username.
    // This mirrors the backend's require_worker_role check:
    // UserRole must be WORKER or ADMIN, and idir_username must be present.
    // All IDIR-authenticated users with idir_username satisfy this requirement.
    if (!isIdirSession(session)) {
        throw redirect(302, '/');
    }
    return { session };
};
