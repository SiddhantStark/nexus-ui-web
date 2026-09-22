import { useCommerceSlice, useCommerceStore } from '@/features/commerce/CommerceProvider';
import { useOperationFeedback } from '@/shared/notifications/useOperationFeedback';
import type { Product } from './types';
export function useCatalog() {
  const products = useCommerceSlice('products');
  const store = useCommerceStore();
  const report = useOperationFeedback();
  return {
    products,
    addProduct: (product: Omit<Product, 'id'>) =>
      report(store.saveProduct({ ...product, id: `prod-${crypto.randomUUID()}` }), 'Product saved'),
    updateProduct: (product: Product) => report(store.saveProduct(product), 'Product updated'),
    setProductActive: (id: string, active: boolean) =>
      report(
        store.setProductActive(id, active),
        active ? 'Product activated' : 'Product deactivated',
      ),
  };
}
