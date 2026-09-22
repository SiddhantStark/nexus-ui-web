import { useCommerceSlice, useCommerceStore } from '@/features/commerce/CommerceProvider';
import { useOperationFeedback } from '@/shared/notifications/useOperationFeedback';
export function useInventory() {
  const products = useCommerceSlice('products');
  const store = useCommerceStore();
  const report = useOperationFeedback();
  return {
    products,
    adjustStock: (id: string, quantity: number, mode: 'add' | 'subtract') =>
      report(store.adjustStock(id, quantity, mode), 'Product updated'),
  };
}
