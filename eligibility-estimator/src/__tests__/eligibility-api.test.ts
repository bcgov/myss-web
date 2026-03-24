// src/__tests__/eligibility-api.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { calculateEligibility } from '../api/eligibility';

const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

const baseRequest = {
  relationship_status: 'SINGLE' as const,
  num_dependants: 0,
  applicant_pwd: false,
  spouse_pwd: false,
  monthly_income: '800.00',
  spouse_monthly_income: '0.00',
  primary_vehicle_value: '0.00',
  other_vehicle_value: '0.00',
  other_asset_value: '0.00',
};

beforeEach(() => {
  mockFetch.mockReset();
});

describe('calculateEligibility', () => {
  it('returns EligibilityResponse on 200', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        eligible: true,
        estimated_amount: '260.00',
        ineligibility_reason: null,
        client_type: 'A',
      }),
    });
    const result = await calculateEligibility('https://api.example.com', baseRequest);
    expect(result.eligible).toBe(true);
    expect(result.estimated_amount).toBe('260.00');
    expect(result.client_type).toBe('A');
  });

  it('throws on non-200 response', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 422,
      json: async () => ({ detail: 'Validation error' }),
    });
    await expect(calculateEligibility('https://api.example.com', baseRequest)).rejects.toThrow();
  });

  it('calls the correct endpoint URL', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        eligible: false,
        estimated_amount: '0.00',
        ineligibility_reason: 'income_exceeds_limit',
        client_type: 'A',
      }),
    });
    await calculateEligibility('https://api.example.com', baseRequest);
    expect(mockFetch).toHaveBeenCalledWith(
      'https://api.example.com/eligibility-estimator/calculate',
      expect.objectContaining({ method: 'POST' }),
    );
  });

  it('uses trailing-slash-safe URL construction', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ eligible: true, estimated_amount: '100.00', ineligibility_reason: null, client_type: 'A' }),
    });
    // API URL with trailing slash must not double-slash
    await calculateEligibility('https://api.example.com/', baseRequest);
    const calledUrl = mockFetch.mock.calls[0][0] as string;
    expect(calledUrl).not.toContain('//eligibility-estimator');
  });
});
