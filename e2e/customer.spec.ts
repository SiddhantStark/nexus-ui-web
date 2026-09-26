import { test, expect, signIn, signOut, startAt } from './fixtures';

test('register, sign in, and reset the session on reload', async ({ page }) => {
  await page.goto('/register');
  await page.getByLabel('Full Name', { exact: true }).fill('Browser Customer');
  await page.getByLabel('Email Address', { exact: true }).fill('browser@example.com');
  await page.getByLabel('Password', { exact: true }).fill('demo-password');
  await page.getByLabel('Confirm Password', { exact: true }).fill('demo-password');
  await page.getByRole('button', { name: 'Create Account' }).click();
  await expect(page).toHaveURL('/login');
  await page.getByLabel('Email address', { exact: true }).fill('browser@example.com');
  await page.getByLabel('Password', { exact: true }).fill('demo-password');
  await page.getByRole('button', { name: 'Sign In', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Account navigation' })).toContainText('Browser');
  await page.reload();
  await expect(page.getByRole('heading', { name: 'Sign in', exact: true })).toBeVisible();
  await page.getByLabel('Email address', { exact: true }).fill('browser@example.com');
  await page.getByLabel('Password', { exact: true }).fill('demo-password');
  await page.getByRole('button', { name: 'Sign In', exact: true }).click();
  await expect(page.getByRole('alert')).toBeVisible();
});

test('browse, edit cart, checkout, cancel and complete the resulting refund', async ({ page }) => {
  await startAt(page, '/products');
  await page.getByRole('textbox', { name: 'Search products' }).fill('ProBook');
  await page.getByRole('combobox', { name: 'Category', exact: true }).selectOption('Electronics');
  await expect(page).toHaveURL(/q=ProBook.*category=Electronics/);
  await page.getByRole('link', { name: 'View ProBook Air 15', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'ProBook Air 15', exact: true })).toBeVisible();
  await page
    .getByRole('button', { name: 'Buy Now', exact: true })
    .locator('..')
    .getByRole('button', { name: 'Add to Cart', exact: true })
    .click();
  await page.getByRole('link', { name: 'Shopping cart, 1 items' }).click();
  await page.getByRole('button', { name: 'Increase quantity of ProBook Air 15' }).click();
  await expect(page.getByRole('link', { name: 'Shopping cart, 2 items' })).toBeVisible();
  await expect(page.getByText('$2,598.00', { exact: true }).first()).toBeVisible();
  await page.getByRole('button', { name: 'Decrease quantity of ProBook Air 15' }).click();
  await page.getByRole('link', { name: 'Proceed to Checkout' }).click();
  await page.getByRole('button', { name: /Place Demo Order/ }).click();
  await expect(page.getByText('Phone number is required.', { exact: true })).toBeVisible();
  await page.getByLabel('Phone Number *', { exact: true }).fill('5550100');
  await page.getByLabel('Street Address *', { exact: true }).fill('42 Demo Street');
  await page.getByLabel('City *', { exact: true }).fill('Springfield');
  await page.getByLabel('State *', { exact: true }).fill('IL');
  await page.getByLabel('Postal Code *', { exact: true }).fill('62701');
  await page.getByRole('button', { name: 'Place Demo Order · $1,299.00', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Order Confirmed!' })).toBeVisible();
  await page.getByRole('link', { name: 'View Order Details' }).click();
  const orderId = new URL(page.url()).pathname.split('/').at(-1)!;
  await expect(page.getByText('Paid', { exact: true }).first()).toBeVisible();
  await page.getByRole('button', { name: 'Cancel Order', exact: true }).click();
  const dialog = page.getByRole('dialog', { name: 'Cancel this order?' });
  await expect(dialog.getByRole('button', { name: 'Cancel', exact: true })).toBeFocused();
  await dialog.getByRole('button', { name: 'Yes, Cancel Order' }).click();
  await expect(page.getByText('Refund Pending', { exact: true }).first()).toBeVisible();
  await expect(page.getByRole('button', { name: 'Cancel Order', exact: true })).toBeHidden();
  await signOut(page);
  await signIn(page, 'admin');
  await page.getByRole('button', { name: 'Account navigation' }).click();
  await page.getByRole('link', { name: 'Admin Dashboard', exact: true }).click();
  await page
    .getByRole('navigation', { name: 'Admin navigation' })
    .getByRole('link', { name: 'Refunds' })
    .click();
  const row = page.getByRole('row').filter({ hasText: orderId });
  await expect(row).toContainText('$1,299.00');
  await row.getByRole('button', { name: 'Approve', exact: true }).click();
  await page.getByRole('dialog').getByRole('button', { name: 'Approve Refund' }).click();
  await expect(row).toContainText('Completed');
  await expect(row.getByRole('button', { name: 'Approve', exact: true })).toBeHidden();
  await page
    .getByRole('navigation', { name: 'Admin navigation' })
    .getByRole('link', { name: 'Orders', exact: true })
    .click();
  await expect(page.getByRole('row').filter({ hasText: orderId })).toContainText('Refunded');
});

test('remove the last cart item', async ({ page }) => {
  await startAt(page, '/products/prod-001');
  await page
    .getByRole('button', { name: 'Buy Now', exact: true })
    .locator('..')
    .getByRole('button', { name: 'Add to Cart', exact: true })
    .click();
  await page.getByRole('link', { name: 'Shopping cart, 1 items' }).click();
  await page.getByRole('button', { name: 'Remove ProBook Air 15', exact: true }).click();
  await expect(page.getByRole('link', { name: 'Shopping cart, 0 items' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Proceed to Checkout' })).toBeHidden();
});

test('customer cannot enter admin pages', async ({ page }) => {
  await page.goto('/admin/products');
  await signIn(page);
  // Sign-in sanitizes an admin return URL for a customer.
  await expect(page).toHaveURL('/');
  // Exercise the mounted route guard without reloading the in-memory session.
  await page.evaluate(() => {
    window.history.pushState({}, '', '/admin/products');
    window.dispatchEvent(new PopStateEvent('popstate'));
  });
  await expect(page).toHaveURL('/forbidden');
  await expect(page.getByRole('heading', { name: 'Access denied' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Add Product' })).toBeHidden();
});
