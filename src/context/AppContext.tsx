import {
  createContext,
  useContext,
  useState,
  useCallback,
  useRef,
  useEffect,
  useSyncExternalStore,
  type ReactNode,
} from 'react';
import type { Product, User, Toast, DeliveryAddress } from '../types';
import {
  cartProblems,
  createCommerceStore,
  type Outcome,
  type CommerceState,
  type Scenario,
} from '../demo/commerce';

const DEMO_ACCOUNTS = [
  {
    user: {
      id: 'usr-001',
      name: 'Alex Rivera',
      email: 'customer@nexuscommerce.com',
      role: 'customer',
    } as User,
    password: 'password123',
  },
  {
    user: {
      id: 'usr-admin',
      name: 'Jordan Kim',
      email: 'admin@nexuscommerce.com',
      role: 'admin',
    } as User,
    password: 'admin123',
  },
];
function useAppState(initialState?: CommerceState) {
  const [store] = useState(() => createCommerceStore(initialState));
  const commerce = useSyncExternalStore(store.subscribe, store.getSnapshot);
  const accounts = useRef(structuredClone(DEMO_ACCOUNTS));
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const timers = useRef(new Map<string, ReturnType<typeof setTimeout>>());
  useEffect(() => {
    const activeTimers = timers.current;
    return () => {
      activeTimers.forEach(clearTimeout);
      activeTimers.clear();
    };
  }, []);
  const removeToast = useCallback((id: string) => {
    clearTimeout(timers.current.get(id));
    timers.current.delete(id);
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);
  const addToast = useCallback(
    (message: string, type: Toast['type'] = 'info') => {
      const id = crypto.randomUUID();
      setToasts((prev) => [...prev, { id, message, type }]);
      timers.current.set(
        id,
        setTimeout(() => removeToast(id), 4000),
      );
    },
    [removeToast],
  );
  const report = (result: Outcome, message: string) => {
    addToast(result.success ? message : result.error, result.success ? 'success' : 'error');
    return result.success;
  };
  async function login(email: string, password: string) {
    const account = accounts.current.find((a) => a.user.email === email.trim().toLowerCase());
    if (!account || account.password !== password)
      return { success: false, error: 'Invalid email or password.' };
    setCurrentUser(account.user);
    return { success: true, user: account.user };
  }
  async function register(name: string, email: string, password: string) {
    const normalized = email.trim().toLowerCase();
    if (!name.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized) || password.length < 8)
      return {
        success: false,
        error: 'Enter a name, valid email, and password of at least 8 characters.',
      };
    if (accounts.current.some((a) => a.user.email === normalized))
      return { success: false, error: 'An account with this email already exists.' };
    accounts.current.push({
      user: { id: crypto.randomUUID(), name: name.trim(), email: normalized, role: 'customer' },
      password,
    });
    return { success: true };
  }
  return {
    ...commerce,
    currentUser,
    login,
    register,
    toasts,
    addToast,
    removeToast,
    logout() {
      setCurrentUser(null);
      store.clearCart();
    },
    cartProblems: cartProblems(commerce),
    cartTotal:
      commerce.cart.reduce((sum, i) => sum + Math.round(i.product.price * 100) * i.quantity, 0) /
      100,
    cartCount: commerce.cart.reduce((sum, i) => sum + i.quantity, 0),
    addToCart: (product: Product, quantity = 1) =>
      report(store.addToCart(product.id, quantity), `${quantity}× ${product.name} added to cart`),
    removeFromCart: (id: string) => store.updateQuantity(id, 0),
    updateCartQuantity: (id: string, quantity: number) => {
      const result = store.updateQuantity(id, quantity);
      if (!result.success) addToast(result.error, 'error');
      return result.success;
    },
    clearCart: store.clearCart,
    addProduct: (product: Product) => report(store.saveProduct(product), 'Product saved'),
    updateProduct: (product: Product) => report(store.saveProduct(product), 'Product updated'),
    checkout: (address: DeliveryAddress, version: number, attempt: string, scenario: Scenario) =>
      store.checkout(address, currentUser, version, attempt, scenario),
    cancelOrder: (id: string) =>
      report(
        store.cancelOrder(id, currentUser),
        'Order cancelled. Any paid amount now has a pending demo refund.',
      ),
    requestRefund: (id: string, reason: string) =>
      report(store.requestRefund(id, reason, currentUser), 'Demo refund request submitted.'),
    resolveRefund: (id: string, outcome: 'completed' | 'rejected' | 'failed') =>
      report(store.resolveRefund(id, outcome, currentUser), `Demo refund ${outcome}.`),
    confirmOrder: (id: string) =>
      report(store.confirmOrder(id, currentUser), 'Order confirmed; payment status unchanged.'),
  };
}
const AppContext = createContext<ReturnType<typeof useAppState> | null>(null);
export function AppProvider({
  children,
  initialState,
}: {
  children: ReactNode;
  initialState?: CommerceState;
}) {
  const value = useAppState(initialState);
  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}
export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
}
export function useMyOrders() {
  const { orders, currentUser } = useApp();
  return orders.filter((o) => o.customerId === currentUser?.id);
}
export function useMyTransactions() {
  const { transactions, currentUser } = useApp();
  return transactions.filter((t) => t.customerId === currentUser?.id);
}
