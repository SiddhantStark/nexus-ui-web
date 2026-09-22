import { useCommerceSlice } from '@/features/commerce/CommerceProvider';
export function useDashboard() {
  return {
    products: useCommerceSlice('products'),
    orders: useCommerceSlice('orders'),
    transactions: useCommerceSlice('transactions'),
    refunds: useCommerceSlice('refunds'),
  };
}
