import { useState } from 'react';
import { render, screen, waitFor, within, act, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { checkAccessibility } from '@/test/checkAccessibility';
import { MemoryRouter } from 'react-router';
import { Input, Select, Textarea } from './Input';
import Modal from './Modal';
import ConfirmDialog from './ConfirmDialog';
import ToastContainer from './Toast';
import NotificationProvider, {
  useNotificationActions,
} from '@/shared/notifications/NotificationProvider';
import AppProviders from '@/app/providers';
import RegisterPage from '@/features/auth/pages/RegisterPage';

function DialogHarness({ confirm = false }: { confirm?: boolean }) {
  const [open, setOpen] = useState(false);
  return (
    <main>
      <button onClick={() => setOpen(true)}>Open dialog</button>
      {confirm ? (
        <ConfirmDialog
          open={open}
          title="Cancel order?"
          message="The order will be cancelled."
          onCancel={() => setOpen(false)}
          onConfirm={() => setOpen(false)}
          cancelLabel="Keep order"
        />
      ) : (
        <Modal
          open={open}
          onClose={() => setOpen(false)}
          title="Edit delivery"
          description="Enter your city."
        >
          <Input label="City" />
          <button onClick={() => setOpen(false)}>Save</button>
        </Modal>
      )}
      <button>Outside action</button>
    </main>
  );
}
describe('accessible controls and dialogs', () => {
  it('associates labels, helper text, external descriptions, and errors without losing generated IDs', async () => {
    const view = render(
      <main>
        <p id="external">External guidance</p>
        <Input
          label="Email"
          helperText="Use your own email"
          error="Enter a valid email"
          aria-describedby="external"
        />
        <Select label="Category" helperText="Choose one" error="Required">
          <option>All</option>
        </Select>
        <Textarea label="Reason" helperText="Explain the issue" error="Required" />
      </main>,
    );
    const input = screen.getByLabelText('Email');
    const id = input.id;
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(input).toHaveAccessibleDescription(
      'External guidance Use your own email Enter a valid email',
    );
    expect(screen.getByLabelText('Category')).toHaveAccessibleDescription('Choose one Required');
    expect(screen.getByLabelText('Reason')).toHaveAccessibleDescription(
      'Explain the issue Required',
    );
    await checkAccessibility();
    view.rerender(
      <main>
        <p id="external">External guidance</p>
        <Input label="Email" helperText="Use your own email" aria-describedby="external" />
      </main>,
    );
    expect(screen.getByLabelText('Email').id).toBe(id);
    expect(screen.getByLabelText('Email')).not.toHaveAttribute('aria-invalid', 'true');
  });
  it('focuses the first field, contains Tab/Shift+Tab, closes on Escape, and restores the opener', async () => {
    const user = userEvent.setup();
    render(<DialogHarness />);
    const opener = screen.getByRole('button', { name: 'Open dialog' });
    await user.click(opener);
    const dialog = screen.getByRole('dialog', { name: 'Edit delivery' });
    expect(dialog).toHaveAccessibleDescription('Enter your city.');
    expect(screen.getByLabelText('City')).toHaveFocus();
    await checkAccessibility();
    await user.tab();
    expect(within(dialog).getByRole('button', { name: 'Save' })).toHaveFocus();
    await user.tab();
    expect(within(dialog).getByRole('button', { name: 'Close dialog' })).toHaveFocus();
    await user.tab({ shift: true });
    expect(within(dialog).getByRole('button', { name: 'Save' })).toHaveFocus();
    await user.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    await waitFor(() => expect(opener).toHaveFocus());
    await user.keyboard('{Enter}');
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Close dialog' }));
    await waitFor(() => expect(opener).toHaveFocus());
  });
  it('starts destructive confirmation on its safe action', async () => {
    const user = userEvent.setup();
    render(<DialogHarness confirm />);
    await user.click(screen.getByRole('button', { name: 'Open dialog' }));
    expect(screen.getByRole('button', { name: 'Keep order' })).toHaveFocus();
    await checkAccessibility();
    await user.keyboard('{Enter}');
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  });
  it('validates registration by keyboard, focuses the first invalid field, and passes axe', async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <AppProviders>
          <RegisterPage />
        </AppProviders>
      </MemoryRouter>,
    );
    await user.click(screen.getByLabelText('Full Name'));
    await user.keyboard('{Enter}');
    expect(screen.getByLabelText('Full Name')).toHaveFocus();
    expect(screen.getByLabelText('Full Name')).toHaveAccessibleDescription('Name is required.');
    await checkAccessibility();
  });
});

function NotificationHarness() {
  const { addToast } = useNotificationActions();
  return (
    <main>
      <button onClick={() => addToast('Cart updated', 'success')}>Notify</button>
      <button onClick={() => addToast('Action failed', 'error')}>Fail</button>
      <ToastContainer />
    </main>
  );
}
describe('notification accessibility', () => {
  it('uses polite status for success and a persistent alert for errors with named dismissal', async () => {
    const user = userEvent.setup();
    render(
      <NotificationProvider>
        <NotificationHarness />
      </NotificationProvider>,
    );
    await user.click(screen.getByRole('button', { name: 'Notify' }));
    expect(screen.getByRole('status')).toHaveTextContent('Cart updated');
    await user.click(screen.getByRole('button', { name: 'Fail' }));
    expect(screen.getByRole('alert')).toHaveTextContent('Action failed');
    await checkAccessibility();
    expect(screen.getAllByRole('button', { name: 'Dismiss notification' })).toHaveLength(2);
  });
  it('pauses while focused and keeps errors until dismissed', async () => {
    vi.useFakeTimers();
    render(
      <NotificationProvider>
        <NotificationHarness />
      </NotificationProvider>,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Notify' }));
    act(() => screen.getByRole('button', { name: 'Dismiss notification' }).focus());
    expect(screen.getByRole('button', { name: 'Dismiss notification' })).toHaveFocus();
    act(() => vi.advanceTimersByTime(16000));
    expect(screen.getByRole('status')).toBeInTheDocument();
    act(() => screen.getByRole('button', { name: 'Fail' }).focus());
    fireEvent.click(screen.getByRole('button', { name: 'Fail' }));
    act(() => vi.advanceTimersByTime(16000));
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
    expect(screen.getByRole('alert')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Dismiss notification' }));
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });
});
