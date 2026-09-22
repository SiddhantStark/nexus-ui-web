import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import ConfirmDialog from '@/shared/ui/ConfirmDialog';

describe('ConfirmDialog', () => {
  it('does not confirm when the user cancels, then confirms only on explicit activation', async () => {
    const user = userEvent.setup();
    const onConfirm = vi.fn();
    const onCancel = vi.fn();
    render(
      <ConfirmDialog
        open
        title="Cancel order?"
        message="Confirm cancellation of this demo order."
        confirmLabel="Cancel order"
        cancelLabel="Keep order"
        onConfirm={onConfirm}
        onCancel={onCancel}
      />,
    );

    await user.click(screen.getByRole('button', { name: 'Keep order' }));
    expect(onCancel).toHaveBeenCalledTimes(1);
    expect(onConfirm).not.toHaveBeenCalled();

    await user.click(screen.getByRole('button', { name: 'Cancel order' }));
    expect(onConfirm).toHaveBeenCalledTimes(1);
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it('does not expose actions when closed', () => {
    render(
      <ConfirmDialog
        open={false}
        title="Cancel order?"
        message="Confirm cancellation of this demo order."
        onConfirm={vi.fn()}
        onCancel={vi.fn()}
      />,
    );
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });
});
