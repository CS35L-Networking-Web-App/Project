// E2E: create post, like/unlike, comment/reply/delete comment, delete post and verify across views
// Requires: npm install -D @playwright/test
// Run: npx playwright test tests/posts.e2e.spec.js

import { test, expect } from '@playwright/test';

const BASE_URL = process.env.E2E_BASE_URL || 'http://localhost:5173';
const POST_PREFIX = 'E2E post';

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

async function cleanupTestPosts(page, { email, password }) {
  try {
    if (page.isClosed()) return;
    await page.goto(`${BASE_URL}/`);
    await page.getByLabel('Email', { exact: true }).fill(email);
    await page.getByLabel('Password', { exact: true }).first().fill(password);
    await page.getByRole('button', { name: 'Sign in', exact: true }).click();
    await page.waitForURL('**/home');
  } catch {
    // ignore login errors during cleanup
  }

  // accept any confirm dialogs automatically during cleanup
  page.on('dialog', d => d.accept().catch(() => {}));

  for (let i = 0; i < 5; i++) { // safety cap
    if (page.isClosed()) break;
    const postCard = page.locator('div.container').filter({ hasText: POST_PREFIX }).first();
    const count = await postCard.count().catch(() => 0);
    if (count === 0) break;
    await postCard.locator('button:has([data-testid="DeleteIcon"])').first().click().catch(() => {});
    await page.waitForTimeout(300);
  }
}

test('post lifecycle across home/search/profile with interactions', async ({ page }) => {
  const email = `e2e+post${Date.now()}@example.com`;
  const password = 'Password123!';
  const name = 'Poster';
  const postText = `${POST_PREFIX} ${Date.now()}`;
  const commentText = `E2E comment ${Date.now()}`;
  const replyText = `E2E reply ${Date.now()}`;
  let contextB;

  try {
    // User A creates account and post
    await signUp(page, { name, email, password });
    await signIn(page, { email, password });
    await page.getByPlaceholder('What do you want to share?').fill(postText);
    await page.getByRole('button', { name: 'Post', exact: true }).click();
    await expect(page.getByText(postText, { exact: false })).toBeVisible();
    const postCard = page.locator('div.container').filter({ hasText: postText }).first();

    // Like/unlike by author
    await postCard.getByRole('button', { name: /Like/ }).click();
    await expect(postCard.getByRole('button', { name: /Liked/ })).toBeVisible();
    await postCard.getByRole('button', { name: /Liked/ }).click();
    await expect(postCard.getByRole('button', { name: /^Like/ })).toBeVisible();

    // Create user B in new context
    contextB = await page.context().browser().newContext();
    const pageB = await contextB.newPage();
    const emailB = `e2e+b${Date.now()}@example.com`;
    const nameB = 'Commenter B';
    await signUp(pageB, { name: nameB, email: emailB, password });
    await signIn(pageB, { email: emailB, password });

    // B finds the post and comments
    const postCardB = pageB.locator('div.container').filter({ hasText: postText }).first();
    await postCardB.getByRole('button', { name: /Comment/ }).click();
    await postCardB.getByPlaceholder('Write a comment...').fill(commentText);
    await postCardB.getByRole('button', { name: /^Post$/ }).click();
    const commentRowB = postCardB.locator('div').filter({ hasText: commentText }).first();
    await expect(commentRowB).toBeVisible();

    // B replies twice to build nesting
    const replyButtons = commentRowB.getByRole('button', { name: /^Reply$/ });
    await replyButtons.first().click();
    await commentRowB.getByPlaceholder('Write a reply...').fill(replyText + ' lvl1');
    await replyButtons.nth(1).click();
    await expect(commentRowB.getByText(replyText + ' lvl1', { exact: false })).toBeVisible();

    // reply to the reply (nesting)
    const nestedReply = postCardB.getByText(replyText + ' lvl1').locator('..'); // find parent block
    await postCardB.getByRole('button', { name: /Reply/, exact: false }).last().click();
    await postCardB.getByPlaceholder('Write a reply...').last().fill(replyText + ' lvl2');
    await postCardB.getByRole('button', { name: 'Reply' }).last().click();
    await expect(postCardB.getByText(replyText + ' lvl2', { exact: false })).toBeVisible();

    // B cannot delete A's post
    await expect(postCardB.locator('.header button:has([data-testid="DeleteIcon"])')).toHaveCount(0);

    // B deletes own parent comment; placeholder remains, nested reply stays
    pageB.once('dialog', d => d.accept());
    await commentRowB.locator('button').first().click();
    await expect(postCardB.getByText('This comment has been deleted', { exact: false })).toBeVisible();
    await expect(postCardB.getByText('lvl2', { exact: false })).toBeVisible();

    // Back to A: delete post, ensure removal everywhere
    page.once('dialog', d => d.accept());
    await postCard.locator('button:has([data-testid="DeleteIcon"])').first().click();
    await expect(page.getByText(postText, { exact: false })).toHaveCount(0);

    await page.getByRole('tab', { name: 'Search' }).click();
    await page.getByRole('tab', { name: 'Posts' }).click();
    await expect(page.getByText(postText, { exact: false })).toHaveCount(0);

    await page.getByRole('tab', { name: 'My Profile' }).click();
    await expect(page.getByText(postText, { exact: false })).toHaveCount(0);

  } finally {
    if (contextB) {
      await contextB.close().catch(() => {});
    }
    await cleanupTestPosts(page, { email, password });
  }
});
