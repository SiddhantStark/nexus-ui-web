import type { Product } from '@/features/catalog/types';
import type { CartEntry } from '@/features/cart/types';
import type { DeliveryAddress, Scenario } from '@/features/checkout/types';
import type { Order } from '@/features/orders/types';
import type { Refund } from '@/features/refunds/types';
import type { Transaction } from '@/features/payments/types';
import type { User } from '@/features/auth/types';
import type { Outcome } from '@/shared/lib/outcome';

export interface CommerceState {
  products: Product[];
  cart: CartEntry[];
  orders: Order[];
  transactions: Transaction[];
  refunds: Refund[];
  cartVersion: number;
}
/** Local commerce port. Coordinated operations publish one complete snapshot. */
export interface CommerceStore {
  getSnapshot(): CommerceState;
  subscribe(listener: () => void): () => void;
  addToCart(productId: string, quantity?: number): Outcome;
  updateQuantity(productId: string, quantity: number): Outcome;
  clearCart(): void;
  saveProduct(product: Product): Outcome;
  setProductActive(productId: string, active: boolean): Outcome;
  adjustStock(productId: string, quantity: number, mode: 'add' | 'subtract'): Outcome;
  checkout(
    address: DeliveryAddress,
    user: User | null,
    version: number,
    attempt: string,
    scenario: Scenario,
  ): Outcome<Order>;
  cancelOrder(orderId: string, user: User | null): Outcome;
  requestRefund(orderId: string, reason: string, user: User | null): Outcome;
  resolveRefund(
    refundId: string,
    outcome: 'completed' | 'rejected' | 'failed',
    user: User | null,
  ): Outcome;
  confirmOrder(orderId: string, user: User | null): Outcome;
}
