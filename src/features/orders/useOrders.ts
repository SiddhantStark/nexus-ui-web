import { useCommerceSlice, useCommerceStore } from '@/features/commerce/CommerceProvider';
import { useSession } from '@/features/auth/SessionProvider';
import { useOperationFeedback } from '@/shared/notifications/useOperationFeedback';
export function useOrders() {
  const orders = useCommerceSlice('orders');
  const store = useCommerceStore();
  const { currentUser } = useSession();
  const report = useOperationFeedback();
  return {
    orders,
    cancelOrder: (id: string) =>
      report(
        store.cancelOrder(id, currentUser),
        'Order cancelled. Any paid amount now has a pending demo refund.',
      ),
    confirmOrder: (id: string) =>
      report(store.confirmOrder(id, currentUser), 'Order confirmed; payment status unchanged.'),
  };
}
export function useMyOrders() {
  const orders = useCommerceSlice('orders');
  const { currentUser } = useSession();
  return orders.filter((order) => order.customerId === currentUser?.id);
}
