import type { CommerceState, CommerceStore } from '@/features/commerce/store';
import type { Outcome } from '@/shared/lib/outcome';
import type { Scenario } from '@/features/checkout/types';
import { cartProblems } from '@/features/cart/selectors';
import type { DeliveryAddress } from '@/features/checkout/types';
import type { Order } from '@/features/orders/types';
import type { Product } from '@/features/catalog/types';
import type { Refund } from '@/features/refunds/types';
import type { Transaction } from '@/features/payments/types';
import type { User } from '@/features/auth/types';
import { ADMIN_ORDERS } from '@/mocks/fixtures/orders';
import { PRODUCTS } from '@/mocks/fixtures/catalog';
import { SAMPLE_REFUNDS } from '@/mocks/fixtures/refunds';
import { SAMPLE_TRANSACTIONS } from '@/mocks/fixtures/payments';

export function initialCommerce(): CommerceState {
  const state = structuredClone({
    products: PRODUCTS,
    cart: [],
    orders: ADMIN_ORDERS,
    transactions: SAMPLE_TRANSACTIONS,
    refunds: SAMPLE_REFUNDS,
    cartVersion: 0,
  });
  state.refunds = state.refunds.filter((r) => state.orders.some((o) => o.id === r.orderId));
  state.orders = state.orders.map((o) => {
    const refund = state.refunds.find((r) => r.orderId === o.id);
    if (refund?.status === 'completed')
      return { ...o, orderStatus: 'refunded', paymentStatus: 'refunded' };
    if (refund?.status === 'pending' || refund?.status === 'processing') {
      return { ...o, orderStatus: 'cancelled', paymentStatus: 'refund_pending' };
    }
    return o;
  });
  return state;
}

const fail = (error: string): Outcome<never> => ({ success: false, error });
const ok = <T>(value: T): Outcome<T> => ({ success: true, value });
const id = (prefix: string): string => `${prefix}-${crypto.randomUUID()}`;

/** Synchronous operations publish one coherent snapshot, including during rapid repeated clicks. */
export function createCommerceStore(seed: CommerceState = initialCommerce()): CommerceStore {
  let state = structuredClone(seed);
  const listeners = new Set<() => void>();
  const attempts = new Map<string, Order>();
  const reserved = new Set(
    state.orders
      .filter((o) => o.orderStatus === 'pending' || o.orderStatus === 'confirmed')
      .map((o) => o.id),
  );
  const publish = (next: CommerceState) => {
    state = next;
    listeners.forEach((listener) => listener());
  };
  const orderAccess = (order: Order, user: User | null) =>
    user && (user.role === 'admin' || user.id === order.customerId);
  const pendingRefund = (order: Order, reason: string): Refund => ({
    id: id('REF'),
    orderId: order.id,
    customerId: order.customerId,
    customerName: order.customerName,
    amount: order.total,
    status: 'pending',
    reason,
    requestedAt: new Date().toISOString(),
  });
  function saveProduct(product: Product): Outcome {
    if (
      !Number.isInteger(product.stock) ||
      product.stock < 0 ||
      !Number.isFinite(product.price) ||
      product.price < 0
    ) {
      return fail(
        'Stock must be a nonnegative whole number and price must be finite and nonnegative.',
      );
    }
    const products = state.products.some((p) => p.id === product.id)
      ? state.products.map((p) => (p.id === product.id ? product : p))
      : [product, ...state.products];
    publish({ ...state, products, cartVersion: state.cartVersion + 1 });
    return ok(undefined);
  }
  return {
    getSnapshot: () => state,
    subscribe: (listener: () => void) => {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    addToCart(productId: string, quantity = 1): Outcome {
      const product = state.products.find((p) => p.id === productId);
      const existing = state.cart.find((i) => i.productId === productId);
      if (!Number.isInteger(quantity) || quantity < 1)
        return fail('Quantity must be a positive whole number.');
      if (!product?.active || product.stock <= 0) return fail('This product is unavailable.');
      const total = (existing?.quantity ?? 0) + quantity;
      if (total > product.stock)
        return fail(
          `Only ${product.stock} available; your cart already contains ${existing?.quantity ?? 0}.`,
        );
      const cart = existing
        ? state.cart.map((i) => (i.productId === productId ? { productId, quantity: total } : i))
        : [...state.cart, { productId, quantity }];
      publish({ ...state, cart, cartVersion: state.cartVersion + 1 });
      return ok(undefined);
    },
    updateQuantity(productId: string, quantity: number): Outcome {
      if (!Number.isInteger(quantity) || quantity < 0)
        return fail('Quantity must be a nonnegative whole number.');
      const product = state.products.find((p) => p.id === productId);
      if (quantity && (!product?.active || quantity > product.stock))
        return fail('Requested quantity is unavailable.');
      publish({
        ...state,
        cart:
          quantity === 0
            ? state.cart.filter((i) => i.productId !== productId)
            : state.cart.map((i) => (i.productId === productId ? { ...i, quantity } : i)),
        cartVersion: state.cartVersion + 1,
      });
      return ok(undefined);
    },
    clearCart() {
      publish({ ...state, cart: [], cartVersion: state.cartVersion + 1 });
    },
    saveProduct,
    setProductActive(productId, active) {
      const product = state.products.find((p) => p.id === productId);
      if (!product) return fail('Product unavailable.');
      return saveProduct({ ...product, active });
    },
    adjustStock(productId, quantity, mode) {
      if (!Number.isInteger(quantity) || quantity <= 0)
        return fail('Enter a positive whole number.');
      const product = state.products.find((p) => p.id === productId);
      if (!product) return fail('Product unavailable.');
      const stock =
        mode === 'add' ? product.stock + quantity : Math.max(0, product.stock - quantity);
      return saveProduct({ ...product, stock });
    },
    checkout(
      address: DeliveryAddress,
      user: User | null,
      version: number,
      attempt: string,
      scenario: Scenario,
    ): Outcome<Order> {
      if (!user) return fail('Please sign in before checkout.');
      const previous = attempts.get(attempt);
      if (previous)
        return previous.customerId === user.id ? ok(previous) : fail('Invalid checkout attempt.');
      if (
        Object.values(address).some((value) => !value.trim()) ||
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(address.email.trim())
      )
        return fail('Complete all delivery fields with a valid email.');
      if (!state.cart.length) return fail('Your cart is empty.');
      if (version !== state.cartVersion)
        return fail('Your cart or catalog changed. Review it and try again.');
      if (cartProblems(state).length || scenario === 'inventory-error')
        return fail('Inventory unavailable. Update your cart.');
      if (scenario === 'payment-failed')
        return fail('Simulated payment failed. No charge was made.');
      const orderId = id('ORD');
      const transactionId = id('TXN');
      const createdAt = new Date().toISOString();
      const items = state.cart.map((entry) => {
        // cartProblems checked existence and availability immediately before this synchronous read.
        const product = state.products.find((p) => p.id === entry.productId)!;
        return {
          productId: product.id,
          productName: product.name,
          imageUrl: product.imageUrl,
          quantity: entry.quantity,
          price: Math.round(product.price * 100) / 100,
        };
      });
      const total = items.reduce((sum, i) => sum + Math.round(i.price * 100) * i.quantity, 0) / 100;
      const order: Order = {
        id: orderId,
        customerId: user.id,
        customerName: address.name,
        customerEmail: address.email.trim().toLowerCase(),
        items,
        total,
        orderStatus: 'confirmed',
        paymentStatus: 'paid',
        createdAt,
        deliveryAddress: { ...address },
        transactionId,
        paymentMethod: 'Simulated Payment',
      };
      const tx: Transaction = {
        id: transactionId,
        orderId,
        customerId: user.id,
        customerName: address.name,
        type: 'payment',
        amount: total,
        status: 'success',
        createdAt,
        method: 'Simulated Payment',
      };
      const products = state.products.map((p) => ({
        ...p,
        stock: p.stock - (items.find((i) => i.productId === p.id)?.quantity ?? 0),
      }));
      attempts.set(attempt, order);
      reserved.add(order.id);
      publish({
        ...state,
        products,
        cart: [],
        orders: [order, ...state.orders],
        transactions: [tx, ...state.transactions],
        cartVersion: state.cartVersion + 1,
      });
      return ok(order);
    },
    cancelOrder(orderId: string, user: User | null): Outcome {
      const order = state.orders.find((o) => o.id === orderId);
      if (!order || !orderAccess(order, user)) return fail('Order unavailable.');
      if (order.orderStatus !== 'pending' && order.orderStatus !== 'confirmed')
        return fail('This order cannot be cancelled again.');
      const refund =
        order.paymentStatus === 'paid' ? pendingRefund(order, 'Order cancelled') : undefined;
      const products = reserved.has(order.id)
        ? state.products.map((p) => ({
            ...p,
            stock: p.stock + (order.items.find((i) => i.productId === p.id)?.quantity ?? 0),
          }))
        : state.products;
      reserved.delete(order.id);
      publish({
        ...state,
        products,
        orders: state.orders.map((o) =>
          o.id === orderId
            ? {
                ...o,
                orderStatus: 'cancelled',
                paymentStatus: refund ? 'refund_pending' : o.paymentStatus,
              }
            : o,
        ),
        refunds: refund ? [refund, ...state.refunds] : state.refunds,
      });
      return ok(undefined);
    },
    requestRefund(orderId: string, reason: string, user: User | null): Outcome {
      const order = state.orders.find((o) => o.id === orderId);
      if (!order || !orderAccess(order, user)) return fail('Order unavailable.');
      if (!reason.trim()) return fail('Please provide a reason for the refund.');
      if (
        order.orderStatus !== 'cancelled' ||
        order.paymentStatus !== 'paid' ||
        state.refunds.some(
          (r) => r.orderId === orderId && ['pending', 'processing', 'completed'].includes(r.status),
        )
      )
        return fail('This order already has a refund or is not eligible.');
      publish({
        ...state,
        refunds: [pendingRefund(order, reason.trim()), ...state.refunds],
        orders: state.orders.map((o) =>
          o.id === orderId ? { ...o, paymentStatus: 'refund_pending' } : o,
        ),
      });
      return ok(undefined);
    },
    resolveRefund(
      refundId: string,
      outcome: 'completed' | 'rejected' | 'failed',
      user: User | null,
    ): Outcome {
      if (user?.role !== 'admin') return fail('Admin access required.');
      const refund = state.refunds.find((r) => r.id === refundId);
      const order = state.orders.find((o) => o.id === refund?.orderId);
      if (
        !refund ||
        !order ||
        order.orderStatus !== 'cancelled' ||
        order.paymentStatus !== 'refund_pending'
      )
        return fail('Refund is no longer eligible.');
      if (
        outcome === 'rejected'
          ? refund.status !== 'pending'
          : outcome === 'failed'
            ? refund.status !== 'processing'
            : !['pending', 'processing'].includes(refund.status)
      )
        return fail('Refund has already been handled.');
      const tx: Transaction | undefined =
        outcome === 'completed'
          ? {
              id: id('TXN'),
              orderId: order.id,
              customerId: order.customerId,
              customerName: order.customerName,
              type: 'refund',
              amount: refund.amount,
              status: 'success',
              createdAt: new Date().toISOString(),
              method: 'Simulated Refund',
            }
          : undefined;
      publish({
        ...state,
        refunds: state.refunds.map((r) =>
          r.id === refundId ? { ...r, status: outcome, transactionId: tx?.id } : r,
        ),
        orders: state.orders.map((o) =>
          o.id === order.id
            ? {
                ...o,
                orderStatus: tx ? 'refunded' : 'cancelled',
                paymentStatus: tx ? 'refunded' : 'paid',
              }
            : o,
        ),
        transactions: tx ? [tx, ...state.transactions] : state.transactions,
      });
      return ok(undefined);
    },
    confirmOrder(orderId: string, user: User | null): Outcome {
      const order = state.orders.find((o) => o.id === orderId);
      if (user?.role !== 'admin' || order?.orderStatus !== 'pending')
        return fail('Order cannot be confirmed.');
      publish({
        ...state,
        orders: state.orders.map((o) =>
          o.id === orderId ? { ...o, orderStatus: 'confirmed' } : o,
        ),
      });
      return ok(undefined);
    },
  };
}
