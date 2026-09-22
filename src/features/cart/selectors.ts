import type { Product } from '@/features/catalog/types';
import type { CartEntry } from './types';
export function cartProblems({
  cart,
  products,
}: {
  cart: CartEntry[];
  products: Product[];
}): string[] {
  return cart.flatMap((item) => {
    const product = products.find((p) => p.id === item.productId);
    return !product?.active ||
      !Number.isInteger(item.quantity) ||
      item.quantity < 1 ||
      item.quantity > product.stock
      ? [
          `${product?.name ?? item.productId}: unavailable or quantity exceeds current stock. Please update or remove it.`,
        ]
      : [];
  });
}
/** Missing products remain visible/removable instead of silently disappearing from the cart. */
export function cartLines(cart: CartEntry[], products: Product[]) {
  return cart.map((entry) => ({
    ...entry,
    product: products.find((p) => p.id === entry.productId) ?? {
      id: entry.productId,
      name: 'Unavailable product',
      description: '',
      category: '',
      sku: entry.productId,
      price: 0,
      stock: 0,
      active: false,
      imageUrl: '',
    },
  }));
}
