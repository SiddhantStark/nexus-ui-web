import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import App from '../../App';

async function fillRegistration(user: ReturnType<typeof userEvent.setup>, email: string) {
  await user.type(screen.getByLabelText('Full Name'), 'Demo Shopper');
  await user.type(screen.getByLabelText('Email Address'), email);
  await user.type(screen.getByLabelText('Password', { exact: true }), 'demo-pass-123');
  await user.type(screen.getByLabelText('Confirm Password'), 'demo-pass-123');
}

describe('demo registration', () => {
  it('opens while signed out, validates, registers, shows one toast and signs in', async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByRole('button', { name: 'Create one' }));
    expect(screen.getByRole('heading', { name: 'Create your account' })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Create Account' }));
    expect(screen.getByText('Name is required.')).toBeInTheDocument();
    await fillRegistration(user, ' Shopper@Example.com ');
    await user.click(screen.getByRole('button', { name: 'Create Account' }));
    expect(await screen.findByRole('heading', { name: 'Sign in' })).toBeInTheDocument();
    expect(screen.getAllByText('Demo account created! Please sign in.')).toHaveLength(1);
    await user.type(screen.getByLabelText('Email address'), 'shopper@example.com');
    await user.type(screen.getByLabelText('Password'), 'demo-pass-123');
    await user.click(screen.getByRole('button', { name: 'Sign In' }));
    expect(await screen.findByRole('heading', { name: /Everything you need/ })).toBeInTheDocument();
  });
  it('rejects duplicates after email normalization', async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByRole('button', { name: 'Create one' }));
    await fillRegistration(user, 'CUSTOMER@NEXUSCOMMERCE.COM');
    await user.click(screen.getByRole('button', { name: 'Create Account' }));
    expect(
      await screen.findByText('An account with this email already exists.'),
    ).toBeInTheDocument();
    expect(screen.queryByText('Demo account created! Please sign in.')).not.toBeInTheDocument();
  });
  it('rejects mismatched passwords and does not retain new accounts on remount', async () => {
    const user = userEvent.setup();
    const view = render(<App />);
    await user.click(screen.getByRole('button', { name: 'Create one' }));
    await fillRegistration(user, 'fresh@example.com');
    await user.type(screen.getByLabelText('Confirm Password'), 'different');
    await user.click(screen.getByRole('button', { name: 'Create Account' }));
    expect(screen.getByText('Passwords do not match.')).toBeInTheDocument();
    await user.clear(screen.getByLabelText('Confirm Password'));
    await user.type(screen.getByLabelText('Confirm Password'), 'demo-pass-123');
    await user.click(screen.getByRole('button', { name: 'Create Account' }));
    view.unmount();
    render(<App />);
    await user.type(screen.getByLabelText('Email address'), 'fresh@example.com');
    await user.type(screen.getByLabelText('Password'), 'demo-pass-123');
    await user.click(screen.getByRole('button', { name: 'Sign In' }));
    expect(await screen.findByText('Invalid email or password.')).toBeInTheDocument();
  });
});
