import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expect, it } from 'vitest';
import { MemoryRouter, Routes, Route } from 'react-router';
import AppProviders from '@/app/providers';
import { useSession } from '@/features/auth/SessionProvider';
import { initialCommerce } from '@/mocks/demo-store';
import { checkAccessibility } from '@/test/checkAccessibility';
import OrderDetailsPage from './OrderDetailsPage';

function Harness() {
  const { login } = useSession();
  return (
    <main id="main-content" tabIndex={-1}>
      <button onClick={() => void login('customer@nexuscommerce.com', 'password123')}>
        Sign in
      </button>
      <OrderDetailsPage />
    </main>
  );
}
it('keeps an empty refund reason inside the dialog and focuses its associated error', async () => {
  const state = initialCommerce();
  const order = state.orders.find((o) => o.customerId === 'usr-001')!;
  order.orderStatus = 'cancelled';
  order.paymentStatus = 'paid';
  state.refunds = state.refunds.filter((r) => r.orderId !== order.id);
  const user = userEvent.setup();
  render(
    <MemoryRouter initialEntries={['/orders/' + order.id]}>
      <AppProviders initialState={state}>
        <Routes>
          <Route path="/orders/:orderId" element={<Harness />} />
        </Routes>
      </AppProviders>
    </MemoryRouter>,
  );
  await user.click(screen.getByRole('button', { name: 'Sign in' }));
  await user.click(await screen.findByRole('button', { name: 'Request Refund' }));
  await user.click(screen.getByRole('button', { name: 'Submit Refund Request' }));
  const reason = screen.getByRole('textbox', { name: 'Reason for refund *' });
  expect(reason).toHaveFocus();
  expect(reason).toHaveAttribute('aria-invalid', 'true');
  expect(reason).toHaveAccessibleDescription('Please provide a reason for your refund.');
  await checkAccessibility();
  await user.type(reason, 'The item was damaged.');
  await user.click(screen.getByRole('button', { name: 'Submit Refund Request' }));
  await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  expect(screen.getByText('Refund Pending')).toBeInTheDocument();
});
