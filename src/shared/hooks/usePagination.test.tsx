import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expect, it } from 'vitest';
import { usePagination } from './usePagination';
import Pagination from '@/shared/ui/Pagination';
function List({ count }: { count: number }) {
  const { page, totalPages, setPage } = usePagination(count, 8);
  const items = Array.from({ length: count }, (_, i) => `Item ${i + 1}`);
  return (
    <>
      <ul>
        {items.slice((page - 1) * 8, page * 8).map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
      <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
    </>
  );
}
it('keeps results reachable after a mutation shrinks the last page', async () => {
  const user = userEvent.setup();
  const view = render(<List count={17} />);
  await user.click(screen.getByRole('button', { name: 'Page 3' }));
  expect(screen.getByText('Item 17')).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Page 3' })).toHaveAttribute('aria-current', 'page');
  view.rerender(<List count={9} />);
  expect(screen.getByText('Item 9')).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Page 2' })).toHaveAttribute('aria-current', 'page');
  expect(screen.getByRole('button', { name: 'Next page' })).toBeDisabled();
  view.rerender(<List count={1} />);
  expect(screen.getByText('Item 1')).toBeInTheDocument();
  expect(screen.queryByRole('navigation')).not.toBeInTheDocument();
});
