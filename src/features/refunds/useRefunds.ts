import { useCommerceSlice, useCommerceStore } from '@/features/commerce/CommerceProvider';
import { useSession } from '@/features/auth/SessionProvider';
import { useOperationFeedback } from '@/shared/notifications/useOperationFeedback';
export function useRefunds() {
  const refunds = useCommerceSlice('refunds');
  const store = useCommerceStore();
  const { currentUser } = useSession();
  const report = useOperationFeedback();
  return {
    refunds,
    requestRefund: (id: string, reason: string) =>
      report(store.requestRefund(id, reason, currentUser), 'Demo refund request submitted.'),
    resolveRefund: (id: string, outcome: 'completed' | 'rejected' | 'failed') =>
      report(store.resolveRefund(id, outcome, currentUser), `Demo refund ${outcome}.`),
  };
}
