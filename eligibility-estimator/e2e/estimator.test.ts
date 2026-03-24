// e2e/estimator.test.ts
// Tests the built Custom Element in a real browser via Playwright.
// These tests run against `vite preview` (the built IIFE bundle served via index.html).
import { test, expect } from '@playwright/test';

test.describe('Eligibility Estimator — standalone page', () => {
  test('page loads and custom element is defined', async ({ page }) => {
    await page.goto('/');
    // Custom element is registered; shadow root is attached
    const isDefined = await page.evaluate(
      () => customElements.get('eligibility-estimator') !== undefined,
    );
    expect(isDefined).toBe(true);
  });

  test('form is present inside the shadow DOM', async ({ page }) => {
    await page.goto('/');
    // Playwright can pierce shadow DOM for roles
    await expect(page.getByRole('form', { name: 'Eligibility Estimator' })).toBeVisible();
  });

  test('disclaimer text is visible', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByText(/does not retain your information/i)).toBeVisible();
  });

  test('spouse fields hidden when Single selected (default)', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByLabel(/spouse monthly income/i)).not.toBeVisible();
  });

  test('spouse fields appear when Couple selected', async ({ page }) => {
    await page.goto('/');
    await page.getByLabel(/married or in a relationship/i).check();
    await expect(page.getByLabel(/spouse monthly income/i)).toBeVisible();
    await expect(page.getByLabel(/my spouse has PWD status/i)).toBeVisible();
  });

  test('result panel is hidden on initial load', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('region', { name: 'Eligibility estimate result' })).not.toBeVisible();
  });
});
