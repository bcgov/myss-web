/**
 * Runtime safety gate for mock authentication.
 *
 * Mock auth replaces BCeID/IDIR OIDC with a fake session — absolutely
 * must never be enabled against a production environment. This module
 * centralises the decision so every caller uses the same logic.
 *
 * All three locks must hold:
 *   1. PUBLIC_ALLOW_MOCK_AUTH === 'true'      (explicit opt-in)
 *   2. PUBLIC_ENVIRONMENT_NAME is present and NOT prod-named
 *   3. MOCK_AUTH === 'true'                   (the activation switch)
 */

const PROD_NAMES = new Set(['prod', 'prd', 'production']);

export interface MockAuthDecision {
	enabled: boolean;
	reason: string;
}

export function isMockAuthAllowed(env: Record<string, string | undefined>): MockAuthDecision {
	if (env.PUBLIC_ALLOW_MOCK_AUTH !== 'true') {
		return { enabled: false, reason: 'PUBLIC_ALLOW_MOCK_AUTH is not "true"' };
	}
	const envName = env.PUBLIC_ENVIRONMENT_NAME;
	if (!envName) {
		return { enabled: false, reason: 'PUBLIC_ENVIRONMENT_NAME is not set (failing closed)' };
	}
	if (PROD_NAMES.has(envName.toLowerCase())) {
		return {
			enabled: false,
			reason: `PUBLIC_ENVIRONMENT_NAME="${envName}" identifies a production environment`,
		};
	}
	if (env.MOCK_AUTH !== 'true') {
		return { enabled: false, reason: 'MOCK_AUTH is not "true"' };
	}
	return { enabled: true, reason: 'all three locks set; mock auth active' };
}
