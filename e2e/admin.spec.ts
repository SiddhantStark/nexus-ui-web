import { test, expect, startAt } from './fixtures';

test('edit a product and update its inventory', async ({ page }) => {
  await startAt(page, '/admin/products', 'admin');
  await page.getByRole('link', { name: 'Edit ProBook Air 15', exact: true }).click();
  await page.getByLabel('Product Name *', { exact: true }).fill('ProBook Browser Edition');
  await page.getByLabel('Price ($) *', { exact: true }).fill('1200.25');
  await page.getByRole('button', { name: 'Save Changes' }).click();
  const product = page.getByRole('row').filter({ hasText: 'ProBook Browser Edition' });
  await expect(product).toContainText('$1,200.25');
  await page
    .getByRole('navigation', { name: 'Admin navigation' })
    .getByRole('link', { name: 'Inventory' })
    .click();
  const stock = page.getByRole('row').filter({ hasText: 'ProBook Browser Edition' });
  await expect(stock.getByRole('cell', { name: '15', exact: true }).first()).toBeVisible();
  await stock.getByRole('button', { name: 'Update Stock' }).click();
  await page.getByRole('dialog').getByLabel('Quantity', { exact: true }).fill('3');
  await page.getByRole('dialog').getByRole('button', { name: 'Update', exact: true }).click();
  await expect(page.getByRole('dialog')).toBeHidden();
  await expect(stock.getByRole('cell', { name: '18', exact: true }).first()).toBeVisible();
});

test('reject a pending refund and prevent a second decision', async ({ page }) => {
  await startAt(page, '/admin/refunds', 'admin');
  const row = page.getByRole('row').filter({ hasText: 'REF-2024-0003' });
  await row.getByRole('button', { name: 'Reject', exact: true }).click();
  await page.getByRole('dialog').getByRole('button', { name: 'Reject Request' }).click();
  await expect(row).toContainText('Rejected');
  await expect(row.getByRole('button')).toHaveCount(0);
  await page
    .getByRole('navigation', { name: 'Admin navigation' })
    .getByRole('link', { name: 'Orders', exact: true })
    .click();
  const order = page.getByRole('row').filter({ hasText: 'ORD-2024-8755' });
  await expect(order.getByText('Paid', { exact: true })).toBeVisible();
});

test('approve a pending refund', async ({ page }) => {
  await startAt(page, '/admin/refunds', 'admin');
  const row = page.getByRole('row').filter({ hasText: 'REF-2024-0003' });
  await row.getByRole('button', { name: 'Approve', exact: true }).click();
  await page.getByRole('dialog').getByRole('button', { name: 'Approve Refund' }).click();
  await expect(row).toContainText('Completed');
  await expect(row.getByRole('button')).toHaveCount(0);
});
