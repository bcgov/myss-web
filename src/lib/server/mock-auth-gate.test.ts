import { describe, it, expect } from 'vitest';
import { isMockAuthAllowed } from './mock-auth-gate';

describe('isMockAuthAllowed', () => {
	it('returns enabled when all three locks are set and env is not prod', () => {
		const result = isMockAuthAllowed({
			PUBLIC_ALLOW_MOCK_AUTH: 'true',
			PUBLIC_ENVIRONMENT_NAME: 'DEV1',
			MOCK_AUTH: 'true',
		});
		expect(result.enabled).toBe(true);
	});

	it('rejects when PUBLIC_ALLOW_MOCK_AUTH is missing', () => {
		const result = isMockAuthAllowed({
			PUBLIC_ENVIRONMENT_NAME: 'DEV1',
			MOCK_AUTH: 'true',
		});
		expect(result.enabled).toBe(false);
		expect(result.reason).toMatch(/PUBLIC_ALLOW_MOCK_AUTH/);
	});

	it('rejects when PUBLIC_ALLOW_MOCK_AUTH is not exactly "true"', () => {
		const result = isMockAuthAllowed({
			PUBLIC_ALLOW_MOCK_AUTH: '1',
			PUBLIC_ENVIRONMENT_NAME: 'DEV1',
			MOCK_AUTH: 'true',
		});
		expect(result.enabled).toBe(false);
	});

	it('rejects when MOCK_AUTH is missing', () => {
		const result = isMockAuthAllowed({
			PUBLIC_ALLOW_MOCK_AUTH: 'true',
			PUBLIC_ENVIRONMENT_NAME: 'DEV1',
		});
		expect(result.enabled).toBe(false);
		expect(result.reason).toMatch(/MOCK_AUTH/);
	});

	it('rejects when PUBLIC_ENVIRONMENT_NAME is PROD', () => {
		const result = isMockAuthAllowed({
			PUBLIC_ALLOW_MOCK_AUTH: 'true',
			PUBLIC_ENVIRONMENT_NAME: 'PROD',
			MOCK_AUTH: 'true',
		});
		expect(result.enabled).toBe(false);
		expect(result.reason).toMatch(/production/i);
	});

	it('rejects PROD regardless of case', () => {
		for (const name of ['prod', 'Production', 'PRODUCTION', 'prd', 'PRD']) {
			const result = isMockAuthAllowed({
				PUBLIC_ALLOW_MOCK_AUTH: 'true',
				PUBLIC_ENVIRONMENT_NAME: name,
				MOCK_AUTH: 'true',
			});
			expect(result.enabled).toBe(false);
		}
	});

	it('rejects when PUBLIC_ENVIRONMENT_NAME is missing', () => {
		const result = isMockAuthAllowed({
			PUBLIC_ALLOW_MOCK_AUTH: 'true',
			MOCK_AUTH: 'true',
		});
		expect(result.enabled).toBe(false);
		expect(result.reason).toMatch(/PUBLIC_ENVIRONMENT_NAME/);
	});
});
