import LinkButton from '../../components/ui/LinkButton';
import { useApp } from '../../context/AppContext';
import StatusBadge from '../../components/ui/StatusBadge';
import { useParams } from 'react-router';

export default function OrderSuccessPage() {
  const { orderId } = useParams();
  const { orders, currentUser } = useApp();
  const order = orders.find((o) => o.id === orderId && o.customerId === currentUser?.id);

  if (!order) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-20 text-center">
        <h1 className="text-slate-500 mb-4">Order not found.</h1>
        <LinkButton to={'/orders'}>View My Orders</LinkButton>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-6 py-12 animate-fade-in">
      {/* Success hero */}
      <div className="text-center mb-8">
        <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-5 ring-8 ring-emerald-50/50">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="w-10 h-10 text-emerald-500"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 mb-2">{'Order Confirmed!'}</h1>
        <p className="text-slate-600">
          {'Thank you, '}
          <strong>{order.customerName.split(' ')[0]}</strong>
          {'! Your demo order has been placed. Payment was simulated; no real charge was made.'}
        </p>
      </div>

      {/* Order card */}
      <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm mb-5">
        {/* Header */}
        <div className="bg-slate-50 border-b border-slate-100 px-6 py-4 flex items-center justify-between flex-wrap gap-2">
          <div>
            <p className="text-xs text-slate-500 mb-0.5">Order Number</p>
            <p className="text-base font-bold text-slate-900 font-mono">{order.id}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-slate-500 mb-0.5">Placed on</p>
            <p className="text-sm font-medium text-slate-900">
              {new Date(order.createdAt).toLocaleDateString('en-US', {
                weekday: 'short',
                month: 'long',
                day: 'numeric',
              })}
            </p>
          </div>
        </div>

        {/* Status row */}
        <div className="px-6 py-4 flex items-center gap-4 flex-wrap border-b border-slate-100">
          <div>
            <p className="text-xs text-slate-500 mb-1">Order Status</p>
            <StatusBadge status={order.orderStatus} size="md" />
          </div>
          <div>
            <p className="text-xs text-slate-500 mb-1">Payment Status</p>
            <StatusBadge status={order.paymentStatus} size="md" />
          </div>
          <div>
            <p className="text-xs text-slate-500 mb-1">Payment Method</p>
            <span className="text-sm font-medium text-slate-700">{order.paymentMethod}</span>
          </div>
        </div>

        {/* Items */}
        <div className="px-6 py-4 flex flex-col gap-3">
          <p className="text-sm font-semibold text-slate-700 mb-1">Items Ordered</p>
          {order.items.map((item) => (
            <div key={item.productId} className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg overflow-hidden bg-slate-100 shrink-0">
                <img
                  src={item.imageUrl}
                  alt={item.productName}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-900 truncate">{item.productName}</p>
                <p className="text-xs text-slate-500">Quantity: {item.quantity}</p>
              </div>
              <span className="text-sm font-semibold text-slate-900 shrink-0">
                ${(item.price * item.quantity).toFixed(2)}
              </span>
            </div>
          ))}
        </div>

        {/* Total */}
        <div className="bg-slate-50 border-t border-slate-100 px-6 py-4 flex justify-between items-center">
          <span className="text-sm font-semibold text-slate-700">Total Paid</span>
          <span className="text-xl font-extrabold text-slate-900">${order.total.toFixed(2)}</span>
        </div>
      </div>

      {/* Delivery info */}
      <div className="bg-white border border-slate-100 rounded-xl p-5 mb-6">
        <p className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="w-4 h-4 text-indigo-500"
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
        </p>
        <p className="text-sm text-slate-600">{order.deliveryAddress.name}</p>
        <p className="text-sm text-slate-600">{order.deliveryAddress.address}</p>
        <p className="text-sm text-slate-600">
          {order.deliveryAddress.city}, {order.deliveryAddress.state}{' '}
          {order.deliveryAddress.postalCode}
        </p>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3">
        <LinkButton fullWidth to={`/orders/${encodeURIComponent(order.id)}`}>
          View Order Details
        </LinkButton>
        <LinkButton variant="outline" fullWidth to={'/products'}>
          Continue Shopping
        </LinkButton>
      </div>

      <p className="text-center text-xs text-slate-400 mt-5">
        Demo receipt for <strong>{order.customerEmail}</strong>. No email was sent.
      </p>
    </div>
  );
}
