// src/api/eligibility.ts

export type RelationshipStatus = 'SINGLE' | 'COUPLE';

export interface EligibilityRequest {
  relationship_status: RelationshipStatus;
  num_dependants: number;
  applicant_pwd: boolean;
  spouse_pwd: boolean;
  monthly_income: string;        // Decimal as string — preserves precision through JSON
  spouse_monthly_income: string;
  primary_vehicle_value: string;
  other_vehicle_value: string;
  other_asset_value: string;
}

export interface EligibilityResponse {
  eligible: boolean;
  estimated_amount: string;       // Decimal as string
  ineligibility_reason: string | null;
  client_type: string;            // "A" | "B" | "C" | "D" | "E"
}

/**
 * Calculate eligibility via the FastAPI backend.
 *
 * @param apiUrl  Base URL of the FastAPI instance (e.g. "https://api.myss.gov.bc.ca").
 *                Trailing slash is tolerated.
 * @param request The eligibility request payload.
 */
export async function calculateEligibility(
  apiUrl: string,
  request: EligibilityRequest,
): Promise<EligibilityResponse> {
  const base = apiUrl.replace(/\/+$/, '');
  const url = `${base}/eligibility-estimator/calculate`;

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Unknown error' }));
    throw new Error(
      `Eligibility calculation failed (${response.status}): ${JSON.stringify(error)}`,
    );
  }

  return response.json() as Promise<EligibilityResponse>;
}
