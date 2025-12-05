// End-to-end tests for signup → login → protected page access
// Requires Playwright: npm install -D @playwright/test
// Run with: npx playwright test tests/auth.e2e.spec.js

import { test, expect } from '@playwright/test';

const BASE_URL = process.env.E2E_BASE_URL || 'http://localhost:5173';
const API_BASE = process.env.E2E_API_BASE || 'http://localhost:4000';

test.describe('Auth flow', () => {
  test('sign up then sign in and reach home with profile update', async ({ page }) => {
    const email = `e2e+${Date.now()}@example.com`;
    const password = 'Password123!';
    const name = 'E2E Tester';

    // Sign up
    await page.goto(`${BASE_URL}/signup`);
    await page.getByLabel('Name').fill(name);
    await page.getByLabel('Email', { exact: true }).fill(email);
    await page.getByLabel('Password', { exact: true }).first().fill(password);
    await page.getByLabel('Re-enter Password', { exact: true }).fill(password);
    await page.getByRole('button', { name: 'Sign Up', exact: true }).click();

    // Wait for redirect back to sign in
    await page.waitForURL('**/');

    // Sign in
    await page.getByLabel('Email', { exact: true }).fill(email);
    await page.getByLabel('Password', { exact: true }).first().fill(password);
    await page.getByRole('button', { name: 'Sign in', exact: true }).click();

    // Expect landing on home
    await page.waitForURL('**/home');
    await expect(page.getByRole('tab', { name: 'Home' })).toBeVisible();

    // Update profile via UI
    const newAbout = 'E2E updated about me text';
    const newLocation = 'E2E City';
    await page.getByRole('tab', { name: 'My Profile' }).click();
    const dialog = page.getByRole('dialog');
    await page.locator('button:has([data-testid="EditOutlinedIcon"])').first().click();
    await dialog.getByLabel('About (optional)').fill(newAbout);
    await dialog.getByLabel('Location (optional)').fill(newLocation);
    await dialog.getByRole('button', { name: 'Save' }).click();
    await expect(dialog).toBeHidden({ timeout: 10000 });

    const aboutBlock = page.locator('.container').filter({ hasText: 'About' }).locator('.regular', { hasText: newAbout });
    const locationBlock = page.locator('.regular', { hasText: newLocation });
    await expect(aboutBlock).toBeVisible({ timeout: 15000 });
    await expect(locationBlock).toBeVisible({ timeout: 15000 });
  });

  test('unauthenticated user is prompted to sign in on protected page', async ({ page }) => {
    await page.goto(`${BASE_URL}/home`);
    await expect(page.getByText('Failed to load user data', { exact: false })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Back to Sign In' })).toBeVisible();
  });
});
