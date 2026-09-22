import type { DeliveryAddress } from '@/features/checkout/types';
import type { PaymentStatus } from '@/features/payments/types';

export type OrderStatus = 'pending' | 'confirmed' | 'cancelled' | 'refunded';

export interface OrderItem {
  productId: string;
  productName: string;
  imageUrl: string;
  quantity: number;
  price: number;
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
