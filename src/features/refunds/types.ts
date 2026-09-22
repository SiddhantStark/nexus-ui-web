export type RefundStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'rejected';

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
