import { test as base, expect, type Page } from '@playwright/test';

export const test = base.extend({
  page: async ({ page }, use) => {
    // External photos/fonts are not commerce dependencies. Keep runs offline and deterministic.
    await page.route('**/*', async (route) => {
      const url = new URL(route.request().url());
      if (url.origin === 'http://127.0.0.1:8458') await route.continue();
      else await route.abort();
    });
    const errors: string[] = [];
    page.on('pageerror', (error) => errors.push(error.message));
    await use(page);
    expect(errors, 'Uncaught application errors').toEqual([]);
  },
});
export { expect };

export async function signIn(page: Page, role: 'customer' | 'admin' = 'customer') {
  await page.getByLabel('Email address', { exact: true }).fill(`${role}@nexuscommerce.com`);
  await page
    .getByLabel('Password', { exact: true })
    .fill(role === 'admin' ? 'admin123' : 'password123');
  await page.getByRole('button', { name: 'Sign In', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Sign in', exact: true })).toBeHidden();
}
export async function startAt(page: Page, path: string, role: 'customer' | 'admin' = 'customer') {
  await page.goto(path);
  await signIn(page, role);
  await expect(page).toHaveURL(path);
}
export async function signOut(page: Page) {
  await page.getByRole('button', { name: 'Account navigation' }).click();
  await page.getByRole('button', { name: 'Sign Out' }).click();
  await expect(page.getByRole('heading', { name: 'Sign in', exact: true })).toBeVisible();
}
