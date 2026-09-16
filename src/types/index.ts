export type OrderStatus = 'pending' | 'confirmed' | 'cancelled' | 'refunded';
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refund_pending' | 'refunded';
export type TransactionType = 'payment' | 'refund';
export type TransactionStatus = 'pending' | 'success' | 'failed';
export type RefundStatus = 'pending' | 'processing' | 'completed' | 'failed';

export interface Product {
  id: string;
  name: string;
  description: string;
  category: string;
  price: number;
  stock: number;
  imageUrl: string;
  sku: string;
  active: boolean;
  specs?: Record<string, string>;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface OrderItem {
  productId: string;
  productName: string;
  imageUrl: string;
  quantity: number;
  price: number;
}

export interface DeliveryAddress {
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  postalCode: string;
}

export interface Order {
  id: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  items: OrderItem[];
  total: number;
  orderStatus: OrderStatus;
  paymentStatus: PaymentStatus;
  createdAt: string;
  deliveryAddress: DeliveryAddress;
  transactionId?: string;
  paymentMethod?: string;
}

export interface Transaction {
  id: string;
  orderId: string;
  customerId: string;
  customerName: string;
  type: TransactionType;
  amount: number;
  status: TransactionStatus;
  createdAt: string;
  method: string;
}

export interface Refund {
  id: string;
  orderId: string;
  customerId: string;
  customerName: string;
  amount: number;
  status: RefundStatus;
  requestedAt: string;
  reason?: string;
  transactionId?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'customer' | 'admin';
}

export interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
}

export type PageName =
  | 'login'
  | 'register'
  | 'home'
  | 'products'
  | 'product-detail'
  | 'cart'
  | 'checkout'
  | 'order-success'
  | 'my-orders'
  | 'order-detail'
  | 'transactions'
  | 'admin-dashboard'
  | 'admin-products'
  | 'admin-product-form'
  | 'admin-inventory'
  | 'admin-orders'
  | 'admin-transactions'
  | 'admin-refunds';

export interface NavigationParams {
  productId?: string;
  orderId?: string;
  category?: string;
  order?: Order;
}

export interface NavigationState {
  page: PageName;
  params?: NavigationParams;
}
