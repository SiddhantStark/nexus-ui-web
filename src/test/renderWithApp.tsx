import AppProviders from '@/app/providers';
import { MemoryRouter } from 'react-router';
import { StrictMode, type ReactElement, type ReactNode } from 'react';
import { render, type RenderOptions } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

function AppTestProviders({ children }: { children: ReactNode }) {
  return (
    <StrictMode>
      <MemoryRouter>
        <AppProviders>{children}</AppProviders>
      </MemoryRouter>
    </StrictMode>
  );
}

/** Each render starts with a fresh demo session and cart. */
export function renderWithApp(ui: ReactElement, options?: Omit<RenderOptions, 'wrapper'>) {
  return {
    user: userEvent.setup(),
    ...render(ui, { ...options, wrapper: AppTestProviders }),
  };
}
