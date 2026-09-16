import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import type {
  CartItem,
  Order,
  Transaction,
  Refund,
  Product,
  User,
  Toast,
  PageName,
  NavigationState,
  NavigationParams,
  OrderStatus,
  PaymentStatus,
  RefundStatus,
} from '../types';
import { PRODUCTS, SAMPLE_TRANSACTIONS, SAMPLE_REFUNDS, ADMIN_ORDERS } from '../data/mockData';

const MOCK_USERS: User[] = [
  {
    id: 'usr-001',
    name: 'Alex Rivera',
    email: 'customer@nexuscommerce.com',
    role: 'customer',
  },
  {
    id: 'usr-admin',
    name: 'Jordan Kim',
    email: 'admin@nexuscommerce.com',
    role: 'admin',
  },
];
const MOCK_PASSWORDS: Record<string, string> = {
  'customer@nexuscommerce.com': 'password123',
  'admin@nexuscommerce.com': 'admin123',
};

interface AppContextType {
  navigation: NavigationState;
  navigate: (page: PageName, params?: NavigationParams) => void;
  currentUser: User | null;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  cart: CartItem[];
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateCartQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  cartTotal: number;
  cartCount: number;
  orders: Order[];
  addOrder: (order: Order) => void;
  updateOrderStatus: (
    orderId: string,
    orderStatus: OrderStatus,
    paymentStatus?: PaymentStatus,
  ) => void;
  transactions: Transaction[];
  addTransaction: (transaction: Transaction) => void;
  refunds: Refund[];
  addRefund: (refund: Refund) => void;
  updateRefundStatus: (refundId: string, status: RefundStatus) => void;
  products: Product[];
  addProduct: (product: Product) => void;
  updateProduct: (product: Product) => void;
  toasts: Toast[];
  addToast: (message: string, type?: Toast['type']) => void;
  removeToast: (id: string) => void;
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [navigation, setNavigation] = useState<NavigationState>({
    page: 'login',
  });
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [orders, setOrders] = useState<Order[]>(ADMIN_ORDERS);
  const [transactions, setTransactions] = useState<Transaction[]>(SAMPLE_TRANSACTIONS);
  const [refunds, setRefunds] = useState<Refund[]>(SAMPLE_REFUNDS);
  const [products, setProducts] = useState<Product[]>(PRODUCTS);
  const [toasts, setToasts] = useState<Toast[]>([]);

  const navigate = useCallback((page: PageName, params?: NavigationParams) => {
    setNavigation({ page, params });
    window.scrollTo({ top: 0 });
  }, []);

  const login = useCallback(
    async (email: string, password: string) => {
      await new Promise((r) => setTimeout(r, 600));
      const user = MOCK_USERS.find((u) => u.email === email);
      if (!user || MOCK_PASSWORDS[email] !== password) {
        return { success: false, error: 'Invalid email or password.' };
      }
      setCurrentUser(user);
      navigate(user.role === 'admin' ? 'admin-dashboard' : 'home');
      return { success: true };
    },
    [navigate],
  );

  const logout = useCallback(() => {
    setCurrentUser(null);
    setCart([]);
    navigate('login');
  }, [navigate]);

  const addToCart = useCallback((product: Product, quantity = 1) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.product.id === product.id);
      if (existing) {
        return prev.map((i) =>
          i.product.id === product.id ? { ...i, quantity: i.quantity + quantity } : i,
        );
      }
      return [...prev, { product, quantity }];
    });
  }, []);

  const removeFromCart = useCallback((productId: string) => {
    setCart((prev) => prev.filter((i) => i.product.id !== productId));
  }, []);

  const updateCartQuantity = useCallback((productId: string, quantity: number) => {
    if (quantity <= 0) {
      setCart((prev) => prev.filter((i) => i.product.id !== productId));
    } else {
      setCart((prev) => prev.map((i) => (i.product.id === productId ? { ...i, quantity } : i)));
    }
  }, []);

  const clearCart = useCallback(() => setCart([]), []);

  const cartTotal = cart.reduce((sum, i) => sum + i.product.price * i.quantity, 0);
  const cartCount = cart.reduce((sum, i) => sum + i.quantity, 0);

  const addOrder = useCallback((order: Order) => {
    setOrders((prev) => [order, ...prev]);
  }, []);

  const updateOrderStatus = useCallback(
    (orderId: string, orderStatus: OrderStatus, paymentStatus?: PaymentStatus) => {
      setOrders((prev) =>
        prev.map((o) =>
          o.id === orderId ? { ...o, orderStatus, ...(paymentStatus ? { paymentStatus } : {}) } : o,
        ),
      );
    },
    [],
  );

  const addTransaction = useCallback((tx: Transaction) => {
    setTransactions((prev) => [tx, ...prev]);
  }, []);

  const addRefund = useCallback((refund: Refund) => {
    setRefunds((prev) => [refund, ...prev]);
  }, []);

  const updateRefundStatus = useCallback((refundId: string, status: RefundStatus) => {
    setRefunds((prev) => prev.map((r) => (r.id === refundId ? { ...r, status } : r)));
  }, []);

  const addProduct = useCallback((product: Product) => {
    setProducts((prev) => [product, ...prev]);
  }, []);

  const updateProduct = useCallback((product: Product) => {
    setProducts((prev) => prev.map((p) => (p.id === product.id ? product : p)));
  }, []);

  const addToast = useCallback((message: string, type: Toast['type'] = 'info') => {
    const id = Math.random().toString(36).slice(2);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 4000);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <AppContext.Provider
      value={{
        navigation,
        navigate,
        currentUser,
        login,
        logout,
        cart,
        addToCart,
        removeFromCart,
        updateCartQuantity,
        clearCart,
        cartTotal,
        cartCount,
        orders,
        addOrder,
        updateOrderStatus,
        transactions,
        addTransaction,
        refunds,
        addRefund,
        updateRefundStatus,
        products,
        addProduct,
        updateProduct,
        toasts,
        addToast,
        removeToast,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}

export function useMyOrders() {
  const { orders, currentUser } = useApp();
  return orders.filter((o) => o.customerId === currentUser?.id);
}

export function useMyTransactions() {
  const { transactions, currentUser } = useApp();
  return transactions.filter((t) => t.customerId === currentUser?.id);
}
