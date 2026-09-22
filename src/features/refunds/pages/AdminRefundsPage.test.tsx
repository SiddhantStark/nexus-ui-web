import { useSession } from '@/features/auth/SessionProvider';
import { useOrders } from '@/features/orders/useOrders';
import { useRefunds } from '@/features/refunds/useRefunds';
import { usePayments } from '@/features/payments/usePayments';
import AppProviders from '@/app/providers';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { initialCommerce } from '@/mocks/demo-store';
import AdminRefundsPage from '@/features/refunds/pages/AdminRefundsPage';

function RefundHarness() {
  const { login } = useSession();
  const { orders } = useOrders();
  const { refunds } = useRefunds();
  const { transactions } = usePayments();
  return (
    <>
      <button
        onClick={() => {
          void login('admin@nexuscommerce.com', 'admin123');
        }}
      >
        Admin sign in
      </button>
      <output aria-label="Reversals">
        {transactions.filter((t) => t.type === 'refund').length}
      </output>
      <output aria-label="Payment state">
        {orders.find((o) => o.id === refunds[0].orderId)?.paymentStatus}
      </output>
      <AdminRefundsPage />
    </>
  );
}
async function ready(status: 'pending' | 'processing') {
  const state = initialCommerce();
  state.refunds = state.refunds.filter((r) => r.status === 'pending').slice(0, 1);
  state.refunds[0].status = status;
  const baseline = state.transactions.filter((t) => t.type === 'refund').length;
  const user = userEvent.setup();
  render(
    <AppProviders initialState={state}>
      <RefundHarness />
    </AppProviders>,
  );
  await user.click(screen.getByRole('button', { name: 'Admin sign in' }));
  return { user, baseline };
}
describe('admin refund actions', () => {
  it.each(['pending', 'processing'] as const)(
    'completes %s refunds and reconciles order and transaction',
    async (status) => {
      const { user, baseline } = await ready(status);
      if (status === 'pending') {
        await user.click(screen.getByRole('button', { name: 'Approve' }));
        await user.click(screen.getByRole('button', { name: 'Approve Refund' }));
      } else {
        await user.click(screen.getByRole('button', { name: 'Mark Complete' }));
      }
      expect(screen.getByLabelText('Reversals')).toHaveTextContent(String(baseline + 1));
      expect(screen.getByLabelText('Payment state')).toHaveTextContent('refunded');
      expect(screen.queryByRole('button', { name: 'Mark Complete' })).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: 'Approve' })).not.toBeInTheDocument();
    },
  );
  it('rejects a request without creating a reversal and restores paid state', async () => {
    const { user, baseline } = await ready('pending');
    await user.click(screen.getByRole('button', { name: 'Reject' }));
    await user.click(screen.getByRole('button', { name: 'Reject Request' }));
    expect(screen.getByLabelText('Reversals')).toHaveTextContent(String(baseline));
    expect(screen.getByLabelText('Payment state')).toHaveTextContent('paid');
    expect(screen.getByText('Rejected', { selector: 'td span' })).toBeInTheDocument();
  });
});
