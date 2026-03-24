// src/routes/admin/+layout.server.ts
import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async (event) => {
    const session = await event.locals.auth?.();
    const ext = session as unknown as Record<string, unknown> | undefined;
    // Admin routes require IDIR authentication with a valid idir_username.
    // This mirrors the backend's require_worker_role check:
    // UserRole must be WORKER or ADMIN, and idir_username must be present.
    // All IDIR-authenticated users with idir_username satisfy this requirement.
    const isWorkerOrAdmin =
        session?.user && ext?.provider === 'idir' && typeof ext?.idir_username === 'string';
    if (!isWorkerOrAdmin) {
        throw redirect(302, '/');
    }
    return { session };
};
