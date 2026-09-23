import { screen, within } from '@testing-library/react';
import { expect, it } from 'vitest';
import { renderWithApp } from '@/test/renderWithApp';
import Navbar from './Navbar';

it('opens navigation by keyboard, dismisses on Escape, and restores the disclosure trigger', async () => {
  const { user } = renderWithApp(<Navbar />);
  const account = screen.getByRole('button', { name: 'Account navigation' });
  await user.click(account);
  expect(account).toHaveAttribute('aria-expanded', 'true');
  await user.tab();
  expect(screen.getByRole('button', { name: 'Sign Out' })).toHaveFocus();
  await user.keyboard('{Escape}');
  expect(account).toHaveFocus();
  expect(account).toHaveAttribute('aria-expanded', 'false');
  await user.keyboard('{Enter}');
  await user.tab();
  await user.tab();
  expect(screen.queryByRole('button', { name: 'Sign Out' })).not.toBeInTheDocument();
  const mobile = screen.getByRole('button', { name: 'Store navigation' });
  expect(mobile).toHaveFocus();
  await user.keyboard('{Enter}');
  const nav = screen.getByRole('navigation', { name: 'Mobile store navigation' });
  await user.tab();
  expect(within(nav).getByRole('link', { name: 'Home' })).toHaveFocus();
  await user.keyboard('{Escape}');
  expect(mobile).toHaveFocus();
  expect(mobile).toHaveAttribute('aria-expanded', 'false');
});
