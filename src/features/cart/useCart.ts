import { useCommerceSlice, useCommerceStore } from '@/features/commerce/CommerceProvider';
import { useNotificationActions } from '@/shared/notifications/NotificationProvider';
import { useOperationFeedback } from '@/shared/notifications/useOperationFeedback';
import type { Product } from '@/features/catalog/types';
import { cartLines, cartProblems } from './selectors';
export function useCart() {
  const store = useCommerceStore();
  const entries = useCommerceSlice('cart');
  const products = useCommerceSlice('products');
  const cartVersion = useCommerceSlice('cartVersion');
  const { addToast } = useNotificationActions();
  const report = useOperationFeedback();
  const cart = cartLines(entries, products);
  return {
    cart,
    cartVersion,
    cartProblems: cartProblems({ cart: entries, products }),
    cartTotal:
      cart.reduce((sum, item) => sum + Math.round(item.product.price * 100) * item.quantity, 0) /
      100,
    cartCount: entries.reduce((sum, item) => sum + item.quantity, 0),
    addToCart: (product: Product, quantity = 1) =>
      report(store.addToCart(product.id, quantity), `${quantity}× ${product.name} added to cart`),
    removeFromCart: (id: string) => store.updateQuantity(id, 0),
    updateCartQuantity: (id: string, quantity: number) => {
      const result = store.updateQuantity(id, quantity);
      if (!result.success) addToast(result.error, 'error');
      return result.success;
    },
    clearCart: store.clearCart,
  };
}
