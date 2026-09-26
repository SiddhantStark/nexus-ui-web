import { fireEvent, render, screen } from '@testing-library/react';
import { expect, it } from 'vitest';
import Image from './Image';

it('shows a named fallback after failure and retries a changed source', () => {
  const view = render(<Image src="/broken.png" alt="Demo laptop" className="h-48 w-full" />);
  fireEvent.error(screen.getByRole('img', { name: 'Demo laptop' }));
  expect(screen.getByRole('img', { name: 'Demo laptop — image unavailable' })).toBeInTheDocument();
  expect(view.container.querySelector('img')).toBeNull();
  view.rerender(<Image src="/replacement.png" alt="Demo laptop" />);
  expect(screen.getByRole('img', { name: 'Demo laptop' })).toHaveAttribute(
    'src',
    '/replacement.png',
  );
});
it('handles missing sources without a failing network request and keeps decorative fallbacks hidden', () => {
  const view = render(<Image src="" alt="Preview" />);
  expect(screen.getByRole('img', { name: 'Preview — image unavailable' })).toBeInTheDocument();
  view.rerender(<Image src="" alt="" />);
  expect(screen.queryByRole('img')).not.toBeInTheDocument();
});
