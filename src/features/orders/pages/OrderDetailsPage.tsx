import OrderStatusBadge from '@/features/orders/components/OrderStatusBadge';
import PaymentStatusBadge from '@/features/payments/components/PaymentStatusBadge';
import TransactionStatusBadge from '@/features/payments/components/TransactionStatusBadge';
import { useSession } from '@/features/auth/SessionProvider';
import { useOrders } from '@/features/orders/useOrders';
import { useRefunds } from '@/features/refunds/useRefunds';
import { usePayments } from '@/features/payments/usePayments';
import LinkButton from '@/shared/ui/LinkButton';
import { useParams } from 'react-router';
import { useRef, useState } from 'react';
import Button from '@/shared/ui/Button';
import Breadcrumbs from '@/shared/ui/Breadcrumbs';
import ConfirmDialog from '@/shared/ui/ConfirmDialog';
import { Textarea } from '@/shared/ui/Input';
export default function OrderDetailsPage() {
  const { currentUser } = useSession();
  const { orders, cancelOrder } = useOrders();
  const { requestRefund } = useRefunds();
  const { transactions } = usePayments();
  const { orderId } = useParams();
  const order = orders.find((o) => o.id === orderId && o.customerId === currentUser?.id);
  const orderTx = transactions.find((t) => t.orderId === orderId && t.type === 'payment');

  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [showRefundDialog, setShowRefundDialog] = useState(false);
  const [refundReason, setRefundReason] = useState('');
  const [refundError, setRefundError] = useState('');
  const refundField = useRef<HTMLTextAreaElement>(null);

  if (!order) {
    return (
      <div className="max-w-5xl mx-auto px-6 py-20 text-center">
        <h1 className="text-slate-500 mb-4">Order not found.</h1>
        <LinkButton to={'/orders'}>Back to Orders</LinkButton>
      </div>
    );
  }

  const canCancel = order.orderStatus === 'pending' || order.orderStatus === 'confirmed';
  const canRefund = order.orderStatus === 'cancelled' && order.paymentStatus === 'paid';

  function handleCancel() {
    if (order && cancelOrder(order.id)) setShowCancelDialog(false);
  }
  function handleRefundRequest() {
    if (!refundReason.trim()) {
      setRefundError('Please provide a reason for your refund.');
      refundField.current?.focus();
      return;
    }
    if (order && requestRefund(order.id, refundReason)) {
      setShowRefundDialog(false);
      setRefundReason('');
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-8 animate-fade-in">
      <Breadcrumbs
        crumbs={[
          { label: 'Home', to: '/' },
          { label: 'My Orders', to: '/orders' },
          { label: order.id },
        ]}
      />

      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-6 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 mb-1">Order Details</h1>
          <p className="text-sm text-slate-500 font-mono">{order.id}</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          {canCancel && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowCancelDialog(true)}
              className="text-red-600 border-red-200 hover:bg-red-50"
            >
              Cancel Order
            </Button>
          )}
          {canRefund && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setRefundError('');
                setShowRefundDialog(true);
              }}
            >
              Request Refund
            </Button>
          )}
          {orderTx && (
            <LinkButton variant="secondary" size="sm" to={'/transactions'}>
              View Transaction
            </LinkButton>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Main */}
        <div className="lg:col-span-2 flex flex-col gap-5">
          {/* Status */}
          <div className="bg-white border border-slate-100 rounded-xl p-5">
            <h2 className="text-sm font-semibold text-slate-700 mb-3">Status</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                {
                  label: 'Order Status',
                  value: <OrderStatusBadge status={order.orderStatus} size="md" />,
                },
                {
                  label: 'Payment Status',
                  value: <PaymentStatusBadge status={order.paymentStatus} size="md" />,
                },
                {
                  label: 'Total Amount',
                  value: (
                    <span className="text-base font-bold text-slate-900">
                      ${order.total.toFixed(2)}
                    </span>
                  ),
                },
                {
                  label: 'Order Date',
                  value: (
                    <span className="text-sm text-slate-700">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </span>
                  ),
                },
              ].map(({ label, value }) => (
                <div key={label}>
                  <p className="text-xs text-slate-500 mb-1">{label}</p>
                  {value}
                </div>
              ))}
            </div>
          </div>

          {/* Items */}
          <div className="bg-white border border-slate-100 rounded-xl overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100">
              <h2 className="text-sm font-semibold text-slate-700">Items Ordered</h2>
            </div>
            <div className="divide-y divide-slate-50">
              {order.items.map((item) => (
                <div key={item.productId} className="px-5 py-4 flex items-center gap-4">
                  <div className="w-14 h-14 rounded-lg overflow-hidden bg-slate-100 shrink-0">
                    <img
                      src={item.imageUrl}
                      alt={item.productName}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-slate-900">{item.productName}</p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Unit price: ${item.price.toFixed(2)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-slate-900">
                      ${(item.price * item.quantity).toFixed(2)}
                    </p>
                    <p className="text-xs text-slate-500">×{item.quantity}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="bg-slate-50 border-t border-slate-100 px-5 py-3.5 flex justify-between">
              <span className="text-sm font-semibold text-slate-700">Total</span>
              <span className="text-base font-extrabold text-slate-900">
                ${order.total.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Transaction */}
          {orderTx && (
            <div className="bg-white border border-slate-100 rounded-xl p-5">
              <h2 className="text-sm font-semibold text-slate-700 mb-3">Transaction Details</h2>
              <div className="grid grid-cols-2 gap-3 text-sm">
                {[
                  { label: 'Transaction ID', value: orderTx.id },
                  { label: 'Method', value: orderTx.method },
                  { label: 'Amount', value: `$${orderTx.amount.toFixed(2)}` },
                  {
                    label: 'Status',
                    value: <TransactionStatusBadge status={orderTx.status} />,
                  },
                  {
                    label: 'Date',
                    value: new Date(orderTx.createdAt).toLocaleString(),
                  },
                ].map(({ label, value }) => (
                  <div key={label}>
                    <p className="text-xs text-slate-500 mb-0.5">{label}</p>
                    <p className="text-sm font-medium text-slate-800 font-mono">{value}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="flex flex-col gap-4">
          {/* Delivery */}
          <div className="bg-white border border-slate-100 rounded-xl p-5">
            <h2 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-1.5">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="w-4 h-4 text-indigo-400"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z"
                />
              </svg>
              Delivery Address
            </h2>
            <div className="text-sm text-slate-600 space-y-0.5">
              <p className="font-medium text-slate-900">{order.deliveryAddress.name}</p>
              <p>{order.deliveryAddress.address}</p>
              <p>
                {order.deliveryAddress.city}, {order.deliveryAddress.state}{' '}
                {order.deliveryAddress.postalCode}
              </p>
              <p className="pt-1">{order.deliveryAddress.phone}</p>
              <p>{order.deliveryAddress.email}</p>
            </div>
          </div>

          {/* Payment info */}
          <div className="bg-white border border-slate-100 rounded-xl p-5">
            <h2 className="text-sm font-semibold text-slate-700 mb-3">Payment</h2>
            <p className="text-sm text-slate-600">{order.paymentMethod}</p>
            <p className="text-xs text-slate-500 mt-1">
              Order placed {new Date(order.createdAt).toLocaleDateString()}
            </p>
          </div>

          {/* Cancel warning */}
          {canCancel && (
            <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 text-xs text-amber-700">
              <p className="font-semibold mb-1">Need to cancel?</p>
              <p>
                You can cancel this order since it has not yet shipped. A refund will be processed
                automatically if payment was taken.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Cancel dialog */}
      <ConfirmDialog
        open={showCancelDialog}
        title="Cancel this order?"
        message={`Order ${order.id} will be cancelled. If payment was processed, a pending demo refund will be created automatically.`}
        confirmLabel="Yes, Cancel Order"
        onConfirm={handleCancel}
        onCancel={() => setShowCancelDialog(false)}
      />

      {/* Refund dialog */}
      <ConfirmDialog
        open={showRefundDialog}
        title="Request a refund?"
        message={`You are requesting a refund of $${order.total.toFixed(2)} for order ${order.id}. Please provide a reason below.`}
        confirmLabel="Submit Refund Request"
        variant="primary"
        onConfirm={handleRefundRequest}
        onCancel={() => setShowRefundDialog(false)}
      >
        <Textarea
          label="Reason for refund *"
          ref={refundField}
          required
          error={refundError}
          placeholder="e.g. Item arrived damaged, wrong product received…"
          value={refundReason}
          onChange={(e) => setRefundReason(e.target.value)}
          rows={3}
        />
      </ConfirmDialog>
    </div>
  );
}
