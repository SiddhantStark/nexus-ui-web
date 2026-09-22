export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refund_pending' | 'refunded';

export type TransactionType = 'payment' | 'refund';

export type TransactionStatus = 'pending' | 'success' | 'failed';

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
