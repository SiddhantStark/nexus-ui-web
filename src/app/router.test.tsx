import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, useLocation, useNavigate, Link } from 'react-router';
import { describe, expect, it } from 'vitest';
import { AppProvider, useApp } from '../context/AppContext';
import AppRoutes from './router';

function HistoryControls() {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useApp();
  return (
    <aside aria-label="Test navigation">
      <output data-testid="location">{location.pathname + location.search}</output>
      <button onClick={() => navigate(-1)}>History back</button>
      <button onClick={() => navigate(1)}>History forward</button>
      <button onClick={logout}>End session</button>
      <Link to="/admin/products">Admin test link</Link>
    </aside>
  );
}
function setup(path: string) {
  const user = userEvent.setup();
  const view = render(
    <MemoryRouter initialEntries={[path]}>
      <AppProvider>
        <HistoryControls />
        <AppRoutes />
      </AppProvider>
    </MemoryRouter>,
  );
  return { user, ...view };
}
async function signIn(user: ReturnType<typeof userEvent.setup>, admin = false) {
  await user.type(
    screen.getByLabelText('Email address'),
    admin ? 'admin@nexuscommerce.com' : 'customer@nexuscommerce.com',
  );
  await user.type(screen.getByLabelText('Password'), admin ? 'admin123' : 'password123');
  await user.click(screen.getByRole('button', { name: 'Sign In' }));
  await waitFor(() =>
    expect(screen.queryByRole('heading', { name: 'Sign in' })).not.toBeInTheDocument(),
  );
}
const location = () => screen.getByTestId('location').textContent;

describe('URL routing', () => {
  it('returns to a product deep link after sign-in and after a fresh app mount', async () => {
    const first = setup('/products/prod-001');
    expect(location()).toBe('/login?next=%2Fproducts%2Fprod-001');
    await signIn(first.user);
    expect(screen.getByRole('heading', { name: 'ProBook Air 15' })).toBeInTheDocument();
    expect(location()).toBe('/products/prod-001');
    first.unmount();
    const second = setup('/products/prod-001');
    expect(screen.getByRole('heading', { name: 'Sign in' })).toBeInTheDocument();
    await signIn(second.user);
    expect(screen.getByRole('heading', { name: 'ProBook Air 15' })).toBeInTheDocument();
  });
  it('preserves the requested URL through the public registration links', async () => {
    const { user } = setup('/products?category=Books');
    await user.click(screen.getByRole('link', { name: 'Create one' }));
    expect(location()).toBe('/register?next=%2Fproducts%3Fcategory%3DBooks');
    expect(screen.getByRole('heading', { name: 'Create your account' })).toBeInTheDocument();
    await user.click(screen.getByRole('link', { name: 'Sign in' }));
    await signIn(user);
    expect(location()).toBe('/products?category=Books');
  });
  it('blocks customer admin navigation and hides protected content after sign-out and back', async () => {
    const { user } = setup('/');
    await signIn(user);
    await user.click(screen.getByRole('link', { name: 'Admin test link' }));
    expect(screen.getByRole('heading', { name: 'Access denied' })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'End session' }));
    expect(screen.getByRole('heading', { name: 'Sign in' })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'History back' }));
    expect(screen.getByRole('heading', { name: 'Sign in' })).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Access denied' })).not.toBeInTheDocument();
  });
  it('returns admins to a protected admin deep link', async () => {
    const { user } = setup('/admin/products');
    await signIn(user, true);
    expect(location()).toBe('/admin/products');
    expect(screen.getByRole('link', { name: /Add Product/ })).toHaveAttribute(
      'href',
      '/admin/products/new',
    );
  });
  it.each([
    '/products/missing',
    '/orders/missing',
    '/orders/missing/success',
    '/orders/ORD-2024-8835',
    '/orders/ORD-2024-8835/success',
  ])('shows a useful error for missing or inaccessible record %s', async (path) => {
    const { user } = setup(path);
    await signIn(user);
    expect(screen.getByRole('heading', { name: /not found/i })).toBeInTheDocument();
    expect(screen.queryByText('Order Confirmed!')).not.toBeInTheDocument();
  });
  it.each(['/orders/ORD-2024-8841', '/orders/ORD-2024-8841/success'])(
    'loads owned order data from the URL %s',
    async (path) => {
      const { user } = setup(path);
      await signIn(user);
      expect(location()).toBe(path);
      expect(screen.queryByRole('heading', { name: /not found/i })).not.toBeInTheDocument();
      expect(screen.getAllByText(/ORD-2024-8841/).length).toBeGreaterThan(0);
    },
  );
  it('does not render a create form for an unknown edit ID', async () => {
    const { user } = setup('/admin/products/missing/edit');
    await signIn(user, true);
    expect(screen.getByRole('heading', { name: /Product not found/ })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Save|Create/ })).not.toBeInTheDocument();
  });
  it('shows a public not-found page for an unknown route', () => {
    setup('/does-not-exist');
    expect(screen.getByRole('heading', { name: 'Page not found' })).toBeInTheDocument();
  });
  it('restores catalog filters with back/forward and retains query state on product navigation', async () => {
    const { user } = setup(
      '/products?q=Pro&category=Electronics&maxPrice=1500&sort=price-desc&page=999',
    );
    await signIn(user);
    expect(screen.getByLabelText('Search products')).toHaveValue('Pro');
    expect(screen.getByLabelText('Maximum price')).toHaveValue(1500);
    expect(screen.getByLabelText('Sort products')).toHaveValue('price-desc');
    await waitFor(() => expect(location()).not.toContain('page='));
    await user.selectOptions(screen.getByLabelText('Category'), 'Books');
    expect(location()).toContain('category=Books');
    await user.click(screen.getByRole('button', { name: 'History back' }));
    expect(screen.getByLabelText('Category')).toHaveValue('Electronics');
    await user.click(screen.getByRole('button', { name: 'History forward' }));
    expect(screen.getByLabelText('Category')).toHaveValue('Books');
    await user.click(screen.getByRole('button', { name: 'History back' }));
    const previous = location();
    await user.click(screen.getByRole('link', { name: /View ProBook Air 15/ }));
    expect(location()).toBe('/products/prod-001');
    await user.click(screen.getByRole('button', { name: 'History back' }));
    expect(location()).toBe(previous);
    expect(screen.getByLabelText('Search products')).toHaveValue('Pro');
  });
  it('normalizes invalid catalog parameters', async () => {
    const { user } = setup('/products?category=invalid&sort=nope&maxPrice=NaN&page=-5');
    await signIn(user);
    await waitFor(() => expect(location()).toBe('/products'));
    expect(screen.getByLabelText('Category')).toHaveValue('All');
    expect(screen.getByLabelText('Sort products')).toHaveValue('name-asc');
    expect(screen.getByLabelText('Maximum price')).toHaveValue(null);
  });
});
