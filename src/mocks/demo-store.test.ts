import { describe, expect, it } from 'vitest';
import { createCommerceStore } from '@/mocks/demo-store';
import { cartProblems } from '@/features/cart/selectors';
import type { CommerceState } from '@/features/commerce/store';
import type { DeliveryAddress } from '@/features/checkout/types';
import type { Product } from '@/features/catalog/types';
import type { User } from '@/features/auth/types';

const customer: User = {
  id: 'customer',
  name: 'Test Customer',
  email: 'test@example.com',
  role: 'customer',
};
const admin: User = { ...customer, id: 'admin', role: 'admin' };
const product: Product = {
  id: 'p1',
  name: 'Headphones',
  description: 'Test product',
  category: 'Electronics',
  price: 19.99,
  stock: 2,
  imageUrl: '/test.png',
  sku: 'P1',
  active: true,
};
const address: DeliveryAddress = {
  name: customer.name,
  email: customer.email,
  phone: '123456789',
  address: '1 Test St',
  city: 'Test City',
  state: 'Test State',
  postalCode: '12345',
};
const seed = (): CommerceState => ({
  products: [product],
  cart: [],
  orders: [],
  refunds: [],
  transactions: [],
  cartVersion: 0,
});
function purchased() {
  const store = createCommerceStore(seed());
  store.addToCart(product.id);
  const result = store.checkout(
    address,
    customer,
    store.getSnapshot().cartVersion,
    'purchase',
    'success',
  );
  if (!result.success) throw new Error(result.error);
  return { store, order: result.value };
}

describe('demo cart and checkout', () => {
  it('enforces combined stock limits synchronously and supports removal', () => {
    const store = createCommerceStore(seed());
    expect(store.addToCart(product.id).success).toBe(true);
    expect(store.addToCart(product.id).success).toBe(true);
    expect(store.addToCart(product.id).success).toBe(false);
    expect(store.getSnapshot().cart[0].quantity).toBe(2);
    expect(store.updateQuantity(product.id, 3).success).toBe(false);
    store.updateQuantity(product.id, 0);
    expect(store.getSnapshot().cart).toEqual([]);
  });
  it.each([0, -1, 0.5, NaN, Infinity])('rejects invalid addition %s', (quantity) => {
    const store = createCommerceStore(seed());
    expect(store.addToCart(product.id, quantity).success).toBe(false);
    expect(store.getSnapshot().cart).toEqual([]);
  });
  it.each([-1, 0.5, NaN, Infinity])('rejects invalid quantity update %s', (quantity) => {
    const store = createCommerceStore(seed());
    store.addToCart(product.id);
    expect(store.updateQuantity(product.id, quantity).success).toBe(false);
    expect(store.getSnapshot().cart[0].quantity).toBe(1);
  });
  it.each([{ stock: 0 }, { active: false }])('rejects unavailable products %j', (patch) => {
    const store = createCommerceStore(seed());
    store.saveProduct({ ...product, ...patch });
    expect(store.addToCart(product.id).success).toBe(false);
  });
  it.each([{ stock: 0 }, { active: false }])(
    'marks existing cart invalid after catalog edits %j',
    (patch) => {
      const store = createCommerceStore(seed());
      store.addToCart(product.id);
      store.saveProduct({ ...product, ...patch });
      expect(cartProblems(store.getSnapshot())).toHaveLength(1);
      expect(
        store.checkout(address, customer, store.getSnapshot().cartVersion, 'a', 'success').success,
      ).toBe(false);
      expect(store.getSnapshot().orders).toHaveLength(0);
    },
  );
  it.each(['payment-failed', 'inventory-error'] as const)(
    'preserves all records on %s',
    (scenario) => {
      const store = createCommerceStore(seed());
      store.addToCart(product.id);
      const before = store.getSnapshot();
      expect(store.checkout(address, customer, before.cartVersion, 'a', scenario).success).toBe(
        false,
      );
      expect(store.getSnapshot()).toBe(before);
    },
  );
  it('revalidates edits made while checkout was processing', () => {
    const store = createCommerceStore(seed());
    store.addToCart(product.id);
    const version = store.getSnapshot().cartVersion;
    store.updateQuantity(product.id, 2);
    expect(store.checkout(address, customer, version, 'a', 'success').success).toBe(false);
    expect(store.getSnapshot().orders).toHaveLength(0);
  });
  it('publishes one coherent checkout and replays an attempt without duplicate payment', () => {
    const store = createCommerceStore(seed());
    store.addToCart(product.id, 2);
    const version = store.getSnapshot().cartVersion;
    const snapshots: CommerceState[] = [];
    store.subscribe(() => snapshots.push(store.getSnapshot()));
    const first = store.checkout(address, customer, version, 'a', 'success');
    expect(first.success).toBe(true);
    expect(store.checkout(address, customer, version, 'a', 'success')).toEqual(first);
    const state = store.getSnapshot();
    expect(snapshots).toHaveLength(1);
    expect(state.products[0].stock).toBe(0);
    expect(state.cart).toHaveLength(0);
    expect(state.orders).toHaveLength(1);
    expect(state.transactions).toHaveLength(1);
    expect(state.orders[0].total).toBe(39.98);
  });
});

describe('demo cancellation and refunds', () => {
  it('cancels a paid order once, restoring stock and creating one pending refund', () => {
    const { store, order } = purchased();
    expect(store.cancelOrder(order.id, customer).success).toBe(true);
    expect(store.cancelOrder(order.id, customer).success).toBe(false);
    expect(store.getSnapshot().products[0].stock).toBe(2);
    expect(store.getSnapshot().refunds).toHaveLength(1);
    expect(store.getSnapshot().orders[0].paymentStatus).toBe('refund_pending');
    expect(store.requestRefund(order.id, 'Again', customer).success).toBe(false);
  });
  it('cancels an unpaid order without creating a refund or payment', () => {
    const { order } = purchased();
    const state = seed();
    state.orders = [{ ...order, orderStatus: 'pending', paymentStatus: 'pending' }];
    state.products = [{ ...product, stock: 1 }];
    const store = createCommerceStore(state);
    store.cancelOrder(order.id, customer);
    expect(store.getSnapshot().products[0].stock).toBe(2);
    expect(store.getSnapshot().refunds).toHaveLength(0);
    expect(store.getSnapshot().transactions).toHaveLength(0);
  });
  it.each(['pending', 'processing'] as const)(
    'completes a %s refund once with the same operation',
    (status) => {
      const { store: original, order } = purchased();
      original.cancelOrder(order.id, customer);
      const state = structuredClone(original.getSnapshot());
      state.refunds[0].status = status;
      const store = createCommerceStore(state);
      const refund = state.refunds[0];
      expect(store.resolveRefund(refund.id, 'completed', admin).success).toBe(true);
      expect(store.resolveRefund(refund.id, 'completed', admin).success).toBe(false);
      expect(store.getSnapshot().orders[0]).toMatchObject({
        orderStatus: 'refunded',
        paymentStatus: 'refunded',
      });
      expect(store.getSnapshot().transactions.filter((t) => t.type === 'refund')).toHaveLength(1);
      expect(store.getSnapshot().products[0].stock).toBe(2);
      expect(store.getSnapshot().refunds[0].transactionId).toBe(
        store.getSnapshot().transactions[0].id,
      );
    },
  );
  it.each(['rejected', 'failed'] as const)(
    'resolves %s to paid without a reversal, allowing a fresh request',
    (outcome) => {
      const { store: original, order } = purchased();
      original.cancelOrder(order.id, customer);
      const state = structuredClone(original.getSnapshot());
      state.refunds[0].status = outcome === 'failed' ? 'processing' : 'pending';
      const store = createCommerceStore(state);
      expect(store.resolveRefund(state.refunds[0].id, outcome, admin).success).toBe(true);
      expect(store.getSnapshot().refunds[0].status).toBe(outcome);
      expect(store.getSnapshot().orders[0].paymentStatus).toBe('paid');
      expect(store.getSnapshot().transactions.filter((t) => t.type === 'refund')).toHaveLength(0);
      expect(store.requestRefund(order.id, 'Please reconsider', customer).success).toBe(true);
      expect(store.requestRefund(order.id, 'Duplicate', customer).success).toBe(false);
    },
  );
  it('rejects customer attempts to approve a refund and another customer cancelling an order', () => {
    const { store, order } = purchased();
    expect(store.cancelOrder(order.id, { ...customer, id: 'other' }).success).toBe(false);
    store.cancelOrder(order.id, customer);
    expect(
      store.resolveRefund(store.getSnapshot().refunds[0].id, 'completed', customer).success,
    ).toBe(false);
  });
});

describe('normalized cart and catalog operations', () => {
  it('stores IDs and quantities, uses current catalog prices, and preserves historical order lines', () => {
    const store = createCommerceStore(seed());
    store.addToCart(product.id, 2);
    expect(store.getSnapshot().cart).toEqual([{ productId: product.id, quantity: 2 }]);
    store.saveProduct({ ...product, name: 'Updated headphones', price: 25.5 });
    const result = store.checkout(
      address,
      customer,
      store.getSnapshot().cartVersion,
      'updated',
      'success',
    );
    expect(result.success).toBe(true);
    expect(store.getSnapshot().orders[0]).toMatchObject({
      total: 51,
      items: [{ productName: 'Updated headphones', price: 25.5, quantity: 2 }],
    });
    store.saveProduct({ ...product, name: 'Later name', price: 100 });
    expect(store.getSnapshot().orders[0].items[0].productName).toBe('Updated headphones');
    expect(store.getSnapshot().orders[0].total).toBe(51);
  });
  it('adjusts the latest inventory and invalidates a pending checkout version', () => {
    const store = createCommerceStore(seed());
    store.addToCart(product.id);
    const version = store.getSnapshot().cartVersion;
    store.saveProduct({ ...product, stock: 10 });
    expect(store.adjustStock(product.id, 3, 'add').success).toBe(true);
    expect(store.getSnapshot().products[0].stock).toBe(13);
    expect(store.checkout(address, customer, version, 'stale', 'success').success).toBe(false);
    expect(store.adjustStock(product.id, 30, 'subtract').success).toBe(true);
    expect(store.getSnapshot().products[0].stock).toBe(0);
    expect(cartProblems(store.getSnapshot())).toHaveLength(1);
  });
  it('rejects invalid inventory and missing product operations without publishing changes', () => {
    const store = createCommerceStore(seed());
    const before = store.getSnapshot();
    for (const quantity of [0, -1, 0.5, NaN, Infinity]) {
      expect(store.adjustStock(product.id, quantity, 'add').success).toBe(false);
    }
    expect(store.adjustStock('missing', 1, 'add').success).toBe(false);
    expect(store.setProductActive('missing', false).success).toBe(false);
    expect(store.getSnapshot()).toBe(before);
  });
  it('deactivates by ID and blocks both existing and new cart additions', () => {
    const store = createCommerceStore(seed());
    store.addToCart(product.id);
    expect(store.setProductActive(product.id, false).success).toBe(true);
    expect(cartProblems(store.getSnapshot())).toHaveLength(1);
    expect(store.addToCart(product.id).success).toBe(false);
    expect(store.setProductActive(product.id, true).success).toBe(true);
    expect(cartProblems(store.getSnapshot())).toHaveLength(0);
  });
  it('isolates stores created from the same fixture', () => {
    const original = seed();
    const first = createCommerceStore(original);
    const second = createCommerceStore(original);
    first.addToCart(product.id);
    first.adjustStock(product.id, 3, 'add');
    expect(second.getSnapshot().cart).toEqual([]);
    expect(second.getSnapshot().products[0].stock).toBe(2);
    expect(original.cart).toEqual([]);
    expect(original.products[0].stock).toBe(2);
  });
});

it('normalizes edited prices and keeps fractional checkout, payment, and refund amounts aligned', () => {
  const store = createCommerceStore(seed());
  expect(store.saveProduct({ ...product, price: 1.005, stock: 3 }).success).toBe(true);
  expect(store.getSnapshot().products[0].price).toBe(1.01);
  store.addToCart(product.id, 3);
  const result = store.checkout(
    address,
    customer,
    store.getSnapshot().cartVersion,
    'fractional',
    'success',
  );
  expect(result.success).toBe(true);
  if (!result.success) throw new Error(result.error);
  expect(result.value.total).toBe(3.03);
  expect(store.getSnapshot().transactions[0].amount).toBe(3.03);
  store.cancelOrder(result.value.id, customer);
  const refund = store.getSnapshot().refunds[0];
  expect(refund.amount).toBe(3.03);
  store.resolveRefund(refund.id, 'completed', admin);
  expect(store.getSnapshot().transactions[0].amount).toBe(3.03);
});
