import { useSession } from '@/features/auth/SessionProvider';
import { useCart } from '@/features/cart/useCart';
import { useCatalog } from '@/features/catalog/useCatalog';
import { useOrders } from '@/features/orders/useOrders';
import AppProviders from '@/app/providers';
import { MemoryRouter, useLocation, useNavigate } from 'react-router';
import { act, fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import CheckoutPage from '@/features/checkout/pages/CheckoutPage';
import { PRODUCTS } from '@/mocks/fixtures/catalog';
import { ADMIN_ORDERS } from '@/mocks/fixtures/orders';

function CheckoutHarness() {
  const { login } = useSession();
  const { cartCount, addToCart } = useCart();
  const { products, updateProduct } = useCatalog();
  const { orders } = useOrders();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  return (
    <>
      <button
        onClick={async () => {
          await login('customer@nexuscommerce.com', 'password123');
          addToCart(products[0]);
          navigate('/checkout');
        }}
      >
        Begin checkout
      </button>
      <button onClick={() => navigate('/products')}>Leave checkout</button>
      <button onClick={() => updateProduct({ ...products[0], stock: 0 })}>
        Sell remaining stock
      </button>
      <output aria-label="Orders">{orders.length}</output>
      <output aria-label="Cart quantity">{cartCount}</output>
      <output aria-label="Available stock">{products[0].stock}</output>
      <output aria-label="Screen">{pathname}</output>
      {pathname === '/checkout' && <CheckoutPage />}
    </>
  );
}
async function ready() {
  const user = userEvent.setup();
  render(
    <MemoryRouter>
      <AppProviders>
        <CheckoutHarness />
      </AppProviders>
    </MemoryRouter>,
  );
  await user.click(screen.getByRole('button', { name: 'Begin checkout' }));
  await screen.findByLabelText('Phone Number *');
  for (const [label, value] of Object.entries({
    'Phone Number *': '12345678',
    'Street Address *': '1 Test Street',
    'City *': 'Test City',
    'State *': 'Test State',
    'Postal Code *': '12345',
  })) {
    fireEvent.change(screen.getByLabelText(label), { target: { value } });
  }
  return user;
}
const finish = async () => {
  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 900));
  });
};

describe('checkout simulation', () => {
  it('submits with Enter, focuses invalid fields, and completes after correction', async () => {
    const user = await ready();
    const phone = screen.getByLabelText('Phone Number *');
    await user.clear(phone);
    await user.keyboard('{Enter}');
    expect(phone).toHaveFocus();
    expect(phone).toHaveAttribute('aria-invalid', 'true');
    expect(phone).toHaveAccessibleDescription('Phone number is required.');
    await user.type(phone, '12345678{Enter}');
    await finish();
    expect(screen.getByLabelText('Screen')).toHaveTextContent(/\/orders\/.+\/success/);
  });
  it('commits only once on repeated clicks and navigates after success', async () => {
    const user = await ready();
    expect(screen.queryByLabelText('Card Number')).not.toBeInTheDocument();
    const submit = screen.getByRole('button', { name: /Place Demo Order/ });
    await user.dblClick(submit);
    await finish();
    expect(screen.getByLabelText('Orders')).toHaveTextContent(String(ADMIN_ORDERS.length + 1));
    expect(screen.getByLabelText('Cart quantity')).toHaveTextContent('0');
    expect(screen.getByLabelText('Available stock')).toHaveTextContent(
      String(PRODUCTS[0].stock - 1),
    );
    expect(screen.getByLabelText('Screen')).toHaveTextContent(/\/orders\/.+\/success/);
  });
  it.each(['✗ Payment Failed', '⚠ Inventory Error'])(
    'preserves cart and orders after %s',
    async (name) => {
      const user = await ready();
      await user.click(screen.getByRole('button', { name }));
      await user.click(screen.getByRole('button', { name: /Place Demo Order/ }));
      await finish();
      expect(screen.getByRole('alert')).toBeInTheDocument();
      expect(screen.getByLabelText('Cart quantity')).toHaveTextContent('1');
      expect(screen.getByLabelText('Orders')).toHaveTextContent(String(ADMIN_ORDERS.length));
    },
  );
  it('does not commit or navigate back when the user leaves during processing', async () => {
    const user = await ready();
    await user.click(screen.getByRole('button', { name: /Place Demo Order/ }));
    await user.click(screen.getByRole('button', { name: 'Leave checkout' }));
    await finish();
    expect(screen.getByLabelText('Screen')).toHaveTextContent('/products');
    expect(screen.getByLabelText('Orders')).toHaveTextContent(String(ADMIN_ORDERS.length));
    expect(screen.getByLabelText('Cart quantity')).toHaveTextContent('1');
  });
  it('rechecks inventory changes during processing', async () => {
    const user = await ready();
    await user.click(screen.getByRole('button', { name: /Place Demo Order/ }));
    await user.click(screen.getByRole('button', { name: 'Sell remaining stock' }));
    await finish();
    expect(
      screen.getByText('Your cart or catalog changed. Review it and try again.'),
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Place Demo Order/ })).toBeDisabled();
    expect(screen.getByLabelText('Orders')).toHaveTextContent(String(ADMIN_ORDERS.length));
  });
});
