// E2E: create post, like/unlike, comment/reply/delete comment, delete post and verify across views
// Requires: npm install -D @playwright/test
// Run: npx playwright test tests/posts.e2e.spec.js

import { test, expect } from '@playwright/test';

const BASE_URL = process.env.E2E_BASE_URL || 'http://localhost:5173';

async function signUp(page, { name, email, password }) {
  await page.goto(`${BASE_URL}/signup`);
  await page.getByLabel('Name', { exact: true }).fill(name);
  await page.getByLabel('Email', { exact: true }).fill(email);
  await page.getByLabel('Password', { exact: true }).first().fill(password);
  await page.getByLabel('Re-enter Password', { exact: true }).fill(password);
  await page.getByRole('button', { name: 'Sign Up', exact: true }).click();
  await page.waitForURL('**/');
}

async function signIn(page, { email, password }) {
  await page.getByLabel('Email', { exact: true }).fill(email);
  await page.getByLabel('Password', { exact: true }).first().fill(password);
  await page.getByRole('button', { name: 'Sign in', exact: true }).click();
  await page.waitForURL('**/home');
}

test('post lifecycle across home/search/profile with interactions', async ({ page }) => {
  const email = `e2e+post${Date.now()}@example.com`;
  const password = 'Password123!';
  const name = 'Poster';
  const postText = `E2E post ${Date.now()}`;
  const commentText = `E2E comment ${Date.now()}`;
  const replyText = `E2E reply ${Date.now()}`;

  // Create account and login
  await signUp(page, { name, email, password });
  await signIn(page, { email, password });

  // Create post
  await page.getByPlaceholder('What do you want to share?').fill(postText);
  await page.getByRole('button', { name: 'Post', exact: true }).click();
  await expect(page.getByText(postText, { exact: false })).toBeVisible();

  // Scope to the post container
  const postCard = page.locator('div.container').filter({ hasText: postText }).first();

  // Like and unlike
  await postCard.getByRole('button', { name: /Like/ }).click();
  await expect(postCard.getByRole('button', { name: /Liked/ })).toBeVisible();
  await postCard.getByRole('button', { name: /Liked/ }).click();
  await expect(postCard.getByRole('button', { name: /^Like/ })).toBeVisible();

  // Open comments and add comment
  await postCard.getByRole('button', { name: /Comment/ }).click();
  await postCard.getByPlaceholder('Write a comment...').fill(commentText);
  await postCard.getByRole('button', { name: /^Post$/ }).click();
  const commentRow = postCard.locator('div').filter({ hasText: commentText }).first();
  await expect(commentRow).toBeVisible();

  // Reply to comment
  const replyButtons = commentRow.getByRole('button', { name: /^Reply$/ });
  await replyButtons.first().click(); // toggle reply box
  await commentRow.getByPlaceholder('Write a reply...').fill(replyText);
  await replyButtons.nth(1).click(); // submit reply
  await expect(commentRow.getByText(replyText, { exact: false })).toBeVisible();

  // Delete parent comment (will leave placeholder and keep reply)
  page.once('dialog', d => d.accept());
  await commentRow.locator('button').first().click();
  await expect(postCard.getByText('This comment has been deleted', { exact: false })).toBeVisible();
  await expect(postCard.getByText(replyText, { exact: false })).toBeVisible();

  // Delete post
  page.once('dialog', d => d.accept());
  await postCard.locator('button:has([data-testid="DeleteIcon"])').first().click();
  await expect(page.getByText(postText, { exact: false })).toHaveCount(0);

  // Verify not in Search > Posts
  await page.getByRole('tab', { name: 'Search' }).click();
  await page.getByRole('tab', { name: 'Posts' }).click();
  await expect(page.getByText(postText, { exact: false })).toHaveCount(0);

  // Verify not in My Profile posts
  await page.getByRole('tab', { name: 'My Profile' }).click();
  await expect(page.getByText(postText, { exact: false })).toHaveCount(0);
});
