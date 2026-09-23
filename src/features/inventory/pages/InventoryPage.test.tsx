import { screen, waitFor, within } from '@testing-library/react';
import { expect, it } from 'vitest';
import { useSession } from '@/features/auth/SessionProvider';
import { renderWithApp } from '@/test/renderWithApp';
import { checkAccessibility } from '@/test/checkAccessibility';
import InventoryPage from './InventoryPage';

function Harness() {
  const { login } = useSession();
  return (
    <main>
      <button onClick={() => void login('admin@nexuscommerce.com', 'admin123')}>Sign in</button>
      <InventoryPage />
    </main>
  );
}
it('labels its table, validates quantity, and submits the stock form with Enter', async () => {
  const { user } = renderWithApp(<Harness />);
  await user.click(screen.getByRole('button', { name: 'Sign in' }));
  const region = screen.getByRole('region', { name: 'Inventory table' });
  expect(region).toHaveAttribute('tabindex', '0');
  const opener = within(region).getAllByRole('button', { name: 'Update Stock' })[0];
  await user.click(opener);
  const quantity = screen.getByRole('spinbutton', { name: 'Quantity' });
  expect(quantity).toHaveFocus();
  await user.keyboard('{Enter}');
  expect(quantity).toHaveAttribute('aria-invalid', 'true');
  expect(quantity).toHaveAccessibleDescription('Enter a positive whole number.');
  await checkAccessibility();
  await user.type(quantity, '1{Enter}');
  await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  await waitFor(() => expect(opener).toHaveFocus());
  const row = within(region).getByRole('row', { name: /ProBook Air 15/ });
  expect(within(row).getByRole('cell', { name: '16' })).toBeInTheDocument();
});
