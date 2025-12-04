// End-to-end tests for signup → login → protected page access
// Requires Playwright: npm install -D @playwright/test
// Run with: npx playwright test tests/auth.e2e.spec.js

import { test, expect } from '@playwright/test';

const BASE_URL = process.env.E2E_BASE_URL || 'http://localhost:5173';

test.describe('Auth flow', () => {
  test('sign up then sign in and reach home', async ({ page }) => {
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
    await page.getByLabel('Email').fill(email);
    await page.getByLabel('Password').fill(password);
    await page.getByRole('button', { name: 'Sign in', exact: true }).click();

    // Expect landing on home
    await page.waitForURL('**/home');
    await expect(page.getByRole('tab', { name: 'Home' })).toBeVisible();
  });

  test('unauthenticated user is prompted to sign in on protected page', async ({ page }) => {
    await page.goto(`${BASE_URL}/home`);
    await expect(page.getByText('Failed to load user data', { exact: false })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Back to Sign In' })).toBeVisible();
  });
});
