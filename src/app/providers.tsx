import { useState, type ReactNode } from 'react';
import SessionProvider from '@/features/auth/SessionProvider';
import CommerceProvider from '@/features/commerce/CommerceProvider';
import NotificationProvider from '@/shared/notifications/NotificationProvider';
import { createCommerceStore } from '@/mocks/demo-store';
import { DEMO_ACCOUNTS } from '@/mocks/fixtures/accounts';
import type { CommerceState } from '@/features/commerce/store';
/** The composition root is the only runtime wiring between features and the demo implementation. */
export default function AppProviders({
  children,
  initialState,
}: {
  children: ReactNode;
  initialState?: CommerceState;
}) {
  const [store] = useState(() => createCommerceStore(initialState));
  return (
    <NotificationProvider>
      <CommerceProvider store={store}>
        <SessionProvider initialAccounts={DEMO_ACCOUNTS} onLogout={store.clearCart}>
          {children}
        </SessionProvider>
      </CommerceProvider>
    </NotificationProvider>
  );
}
