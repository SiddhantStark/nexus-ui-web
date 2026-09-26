import { test, expect, startAt } from './fixtures';

test('product and cart remain usable at the configured viewport', async ({ page }) => {
  await startAt(page, '/products/prod-001');
  await expect(page.getByRole('heading', { name: 'ProBook Air 15', exact: true })).toBeVisible();
  await page
    .getByRole('button', { name: 'Buy Now', exact: true })
    .locator('..')
    .getByRole('button', { name: 'Add to Cart', exact: true })
    .click();
  await page.getByRole('link', { name: 'Shopping cart, 1 items' }).click();
  await expect(page.getByRole('link', { name: 'Proceed to Checkout' })).toBeVisible();
  const fits = await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth);
  expect(fits).toBe(true);
});
