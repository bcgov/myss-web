// src/__tests__/EligibilityEstimator.test.ts
// NOTE: These tests exercise the Svelte component logic using @testing-library/svelte.
// The custom element shell (<svelte:options customElement>) is tested in e2e;
// here we test the component's reactive behaviour in jsdom.
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, fireEvent, screen, waitFor } from '@testing-library/svelte';
import EligibilityEstimatorComponent from '../EligibilityEstimatorComponent.svelte';
import * as api from '../api/eligibility';

vi.mock('../api/eligibility', () => ({
  calculateEligibility: vi.fn(),
}));

const mockCalculate = vi.mocked(api.calculateEligibility);

beforeEach(() => {
  mockCalculate.mockReset();
});

describe('EligibilityEstimator component', () => {
  it('renders the form with disclaimer text', () => {
    render(EligibilityEstimatorComponent, { props: { apiUrl: 'https://api.example.com' } });
    expect(screen.getByRole('form', { name: 'Eligibility Estimator' })).toBeTruthy();
    expect(screen.getByText(/does not retain your information/i)).toBeTruthy();
  });

  it('hides spouse fields when Single is selected', () => {
    render(EligibilityEstimatorComponent, { props: { apiUrl: 'https://api.example.com' } });
    // SINGLE is the default — spouse income field should not be in the DOM
    expect(screen.queryByLabelText(/spouse monthly income/i)).toBeNull();
  });

  it('shows spouse fields when Couple is selected', async () => {
    render(EligibilityEstimatorComponent, { props: { apiUrl: 'https://api.example.com' } });
    await fireEvent.click(screen.getByLabelText(/married or in a relationship/i));
    expect(screen.getByLabelText(/spouse monthly income/i)).toBeTruthy();
  });

  it('shows eligible result after successful calculation', async () => {
    mockCalculate.mockResolvedValueOnce({
      eligible: true,
      estimated_amount: '260.00',
      ineligibility_reason: null,
      client_type: 'A',
    });
    render(EligibilityEstimatorComponent, { props: { apiUrl: 'https://api.example.com' } });
    await fireEvent.click(screen.getByRole('button', { name: /check my eligibility/i }));
    await waitFor(() => {
      expect(screen.getByText(/you may be eligible/i)).toBeTruthy();
      expect(screen.getByText(/CA\$260\.00|\$260\.00/i)).toBeTruthy();
    });
  });

  it('shows income-exceeded message when ineligible due to income', async () => {
    mockCalculate.mockResolvedValueOnce({
      eligible: false,
      estimated_amount: '0.00',
      ineligibility_reason: 'income_exceeds_limit',
      client_type: 'A',
    });
    render(EligibilityEstimatorComponent, { props: { apiUrl: 'https://api.example.com' } });
    await fireEvent.click(screen.getByRole('button', { name: /check my eligibility/i }));
    await waitFor(() => {
      expect(screen.getByText(/income.*exceeds the.*limit/i)).toBeTruthy();
    });
  });

  it('shows error message when API call fails', async () => {
    mockCalculate.mockRejectedValueOnce(new Error('Network error'));
    render(EligibilityEstimatorComponent, { props: { apiUrl: 'https://api.example.com' } });
    await fireEvent.click(screen.getByRole('button', { name: /check my eligibility/i }));
    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeTruthy();
    });
  });

  it('shows registration CTA link when registrationUrl is set and user is eligible', async () => {
    mockCalculate.mockResolvedValueOnce({
      eligible: true,
      estimated_amount: '200.00',
      ineligibility_reason: null,
      client_type: 'A',
    });
    render(EligibilityEstimatorComponent, {
      props: {
        apiUrl: 'https://api.example.com',
        registrationUrl: 'https://myss.gov.bc.ca/registration',
      },
    });
    await fireEvent.click(screen.getByRole('button', { name: /check my eligibility/i }));
    await waitFor(() => {
      const link = screen.getByRole('link', { name: /create an account/i });
      expect(link.getAttribute('href')).toBe('https://myss.gov.bc.ca/registration');
    });
  });

  it('omits registration CTA link when registrationUrl is not set', async () => {
    mockCalculate.mockResolvedValueOnce({
      eligible: true,
      estimated_amount: '200.00',
      ineligibility_reason: null,
      client_type: 'A',
    });
    render(EligibilityEstimatorComponent, { props: { apiUrl: 'https://api.example.com' } });
    await fireEvent.click(screen.getByRole('button', { name: /check my eligibility/i }));
    await waitFor(() => {
      expect(screen.queryByRole('link', { name: /create an account/i })).toBeNull();
    });
  });
});
