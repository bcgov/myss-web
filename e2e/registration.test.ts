// e2e/registration.test.ts
import { test, expect } from '@playwright/test';

test.describe('Registration wizard', () => {
    test('step 1 page loads with account type radio buttons', async ({ page }) => {
        await page.goto('/registration');
        await expect(page.getByRole('heading', { name: 'Create an Account' })).toBeVisible();
        await expect(page.getByText('Step 1 of 5')).toBeVisible();
        await expect(page.getByLabel('I am making an account for myself')).toBeVisible();
    });

    test('helper auth fields show when WITH_HELPER selected', async ({ page }) => {
        await page.goto('/registration');
        await page.getByLabel('Someone is helping me make this account').check();
        await expect(page.getByText('Do you authorise this person to help you?')).toBeVisible();
    });

    test('rep fields show when POA selected', async ({ page }) => {
        await page.goto('/registration');
        await page.getByLabel('I am a legal representative').check();
        await expect(page.getByLabel('Representative first name')).toBeVisible();
        await expect(page.getByLabel('Representative last name')).toBeVisible();
        await expect(page.getByLabel('Representative phone number')).toBeVisible();
    });

    test('step 3 shows email provider picker', async ({ page }) => {
        await page.goto('/registration/fake-token/step-3');
        await expect(page.getByText('Step 3 of 5')).toBeVisible();
        await expect(page.getByLabel('Select email provider')).toBeVisible();
    });

    test('step 4 shows PIN fields', async ({ page }) => {
        await page.goto('/registration/fake-token/pin');
        await expect(page.getByText('Step 4 of 5')).toBeVisible();
        await expect(page.getByLabel('PIN (4 digits)')).toBeVisible();
        await expect(page.getByLabel('Confirm PIN')).toBeVisible();
    });

    test('step 4 shows error when PINs do not match', async ({ page }) => {
        await page.goto('/registration/fake-token/pin');
        await page.getByLabel('PIN (4 digits)').fill('1234');
        await page.getByLabel('Confirm PIN').fill('5678');
        await page.getByRole('button', { name: 'Continue' }).click();
        await expect(page.getByRole('alert')).toContainText('do not match');
    });

    test('step 5 shows BCeID options', async ({ page }) => {
        await page.goto('/registration/fake-token/bceid');
        await expect(page.getByText('Step 5 of 5')).toBeVisible();
        await expect(page.getByText('Already have a BCeID?')).toBeVisible();
        await expect(page.getByText("Don't have a BCeID?")).toBeVisible();
    });

    test('complete page shows account setup message', async ({ page }) => {
        await page.goto('/registration/complete');
        await expect(page.getByRole('heading', { name: 'Your account is being set up' })).toBeVisible();
    });
});
