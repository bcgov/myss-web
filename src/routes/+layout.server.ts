import type { LayoutServerLoad } from './$types';
import { env } from '$env/dynamic/private';
import { isMockAuthAllowed } from '$lib/server/mock-auth-gate';

export const load: LayoutServerLoad = async (event) => {
	const session = await event.locals.auth?.();
	const mockGate = isMockAuthAllowed(env as Record<string, string | undefined>);
	return {
		session,
		mockAuthEnabled: mockGate.enabled,
	};
};
