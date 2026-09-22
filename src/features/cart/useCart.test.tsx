import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { describe, expect, it } from 'vitest';
import userEvent from '@testing-library/user-event';
import AppProviders from '@/app/providers';
import { initialCommerce } from '@/mocks/demo-store';
import { PRODUCTS } from '@/mocks/fixtures/catalog';
import { useCatalog } from '@/features/catalog/useCatalog';
import { useSession } from '@/features/auth/SessionProvider';
import { useNotificationActions } from '@/shared/notifications/NotificationProvider';
import ToastContainer from '@/shared/ui/Toast';
import CartPage from './pages/CartPage';
import { useCart } from './useCart';

function CartHarness() {
  const { products, updateProduct } = useCatalog();
  const { currentUser, login, logout } = useSession();
  const { cartTotal, cartCount, addToCart } = useCart();
  const { addToast } = useNotificationActions();
  return (
    <>
      <button onClick={() => void login('customer@nexuscommerce.com', 'password123')}>
        Sign in fixture
      </button>
      <button onClick={logout}>End session</button>
      <button onClick={() => addToCart(products[0], 2)}>Add two</button>
      <button
        onClick={() =>
          updateProduct({ ...products[0], name: 'Updated catalog name', price: 10.25 })
        }
      >
        Edit catalog
      </button>
      <button onClick={() => addToast('Independent notification')}>Notify</button>
      <output aria-label="Cart total">{cartTotal}</output>
      <output aria-label="Cart count">{cartCount}</output>
      <output aria-label="Session">{currentUser?.name ?? 'Signed out'}</output>
      <CartPage />
      <ToastContainer />
    </>
  );
}
describe('focused cart state', () => {
  it('derives names and totals from the current catalog and clears only the cart on logout', async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <AppProviders>
          <CartHarness />
        </AppProviders>
      </MemoryRouter>,
    );
    await user.click(screen.getByRole('button', { name: 'Sign in fixture' }));
    await user.click(screen.getByRole('button', { name: 'Add two' }));
    await user.click(screen.getByRole('button', { name: 'Edit catalog' }));
    expect(screen.getByLabelText('Cart total')).toHaveTextContent('20.5');
    expect(screen.getByText('Updated catalog name ×2')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Notify' }));
    expect(screen.getByText('Independent notification')).toBeInTheDocument();
    expect(screen.getByLabelText('Cart count')).toHaveTextContent('2');
    expect(screen.getByLabelText('Session')).toHaveTextContent('Alex Rivera');
    await user.click(screen.getByRole('button', { name: 'End session' }));
    expect(screen.getByLabelText('Session')).toHaveTextContent('Signed out');
    expect(screen.getByRole('heading', { name: 'Your cart is empty' })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Sign in fixture' }));
    await user.click(screen.getByRole('button', { name: 'Add two' }));
    expect(screen.getByText('Updated catalog name ×2')).toBeInTheDocument();
    expect(PRODUCTS[0].name).not.toBe('Updated catalog name');
  });
  it('keeps a missing catalog entry removable and prevents checkout', async () => {
    const user = userEvent.setup();
    const initialState = initialCommerce();
    initialState.cart = [{ productId: 'missing', quantity: 1 }];
    render(
      <MemoryRouter>
        <AppProviders initialState={initialState}>
          <CartPage />
        </AppProviders>
      </MemoryRouter>,
    );
    expect(screen.getByText('Unavailable product')).toBeInTheDocument();
    expect(screen.getByText(/missing: unavailable/)).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /Proceed to Checkout/ })).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Remove Unavailable product' }));
    expect(screen.getByRole('heading', { name: 'Your cart is empty' })).toBeInTheDocument();
  });
});
