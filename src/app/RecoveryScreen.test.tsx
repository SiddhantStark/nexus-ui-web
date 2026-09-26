import { lazy, Suspense } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Link, useLocation } from 'react-router';
import { expect, it, vi } from 'vitest';
import ErrorBoundary from '@/shared/ui/ErrorBoundary';
import RecoveryScreen from './RecoveryScreen';
import RouteLoading from './RouteLoading';

function CrashingPage(): never {
  throw new Error('Render failed');
}
function RecoveryHarness() {
  const { pathname } = useLocation();
  return (
    <ErrorBoundary
      key={pathname}
      fallback={<RecoveryScreen homeLink={<Link to="/">Return to store</Link>} />}
    >
      {pathname === '/' ? <h1>Store home</h1> : <CrashingPage />}
    </ErrorBoundary>
  );
}
it('contains render failures and allows navigation to a working route', async () => {
  vi.spyOn(console, 'error').mockImplementation(() => {});
  const user = userEvent.setup();
  render(
    <MemoryRouter initialEntries={['/broken']}>
      <RecoveryHarness />
    </MemoryRouter>,
  );
  expect(screen.getByRole('alert')).toHaveTextContent("We couldn't open this page");
  expect(screen.getByRole('button', { name: 'Reload application' })).toBeInTheDocument();
  expect(screen.getByText(/Reloading resets/)).toBeInTheDocument();
  await user.click(screen.getByRole('link', { name: 'Return to store' }));
  expect(screen.getByRole('heading', { name: 'Store home' })).toBeInTheDocument();
});
it('shows an announced loading state then recovers visibly from a failed page import', async () => {
  vi.spyOn(console, 'error').mockImplementation(() => {});
  let reject!: (reason: Error) => void;
  const Page = lazy(
    () =>
      new Promise<{ default: () => React.ReactNode }>((_, fail) => {
        reject = fail;
      }),
  );
  render(
    <ErrorBoundary fallback={<RecoveryScreen homeLink={<a href="/">Return to store</a>} />}>
      <Suspense fallback={<RouteLoading />}>
        <Page />
      </Suspense>
    </ErrorBoundary>,
  );
  expect(screen.getByRole('status', { name: 'Loading page' })).toBeInTheDocument();
  reject(new Error('Module could not be downloaded'));
  expect(await screen.findByRole('alert')).toHaveTextContent("We couldn't open this page");
});
