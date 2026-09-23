import ScrollRegion from '@/shared/ui/ScrollRegion';
import { usePagination } from '@/shared/hooks/usePagination';
import OrderStatusBadge from '@/features/orders/components/OrderStatusBadge';
import PaymentStatusBadge from '@/features/payments/components/PaymentStatusBadge';
import { useOrders } from '@/features/orders/useOrders';
import { useState } from 'react';
import Button from '@/shared/ui/Button';
import Pagination from '@/shared/ui/Pagination';
import Modal from '@/shared/ui/Modal';

const PER_PAGE = 8;

export default function AdminOrdersPage() {
  const { orders, confirmOrder, cancelOrder } = useOrders();
  const [search, setSearch] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState('all');
  const [paymentStatusFilter, setPaymentStatusFilter] = useState('all');
  const [detailOrder, setDetailOrder] = useState<string | null>(null);

  const filtered = orders.filter((o) => {
    const matchSearch =
      o.id.toLowerCase().includes(search.toLowerCase()) ||
      o.customerName.toLowerCase().includes(search.toLowerCase());
    const matchOrder = orderStatusFilter === 'all' || o.orderStatus === orderStatusFilter;
    const matchPayment = paymentStatusFilter === 'all' || o.paymentStatus === paymentStatusFilter;
    return matchSearch && matchOrder && matchPayment;
  });

  const { page, totalPages, setPage } = usePagination(filtered.length, PER_PAGE);
  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const viewOrder = orders.find((o) => o.id === detailOrder);

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Orders</h1>
          <p className="text-sm text-slate-500 mt-0.5">{orders.length} total orders</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border border-slate-100 rounded-xl p-4 mb-4 flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
            />
          </svg>
          <input
            aria-label="Search orders"
            id="AdminOrdersPage-search-orders"
            placeholder="Search by order ID or customer…"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full pl-9 pr-3 py-2.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400"
          />
        </div>
        <select
          aria-label="Order status"
          id="AdminOrdersPage-order-status"
          value={orderStatusFilter}
          onChange={(e) => {
            setOrderStatusFilter(e.target.value);
            setPage(1);
          }}
          className="px-3 py-2.5 text-sm border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
        >
          <option value="all">All Order Status</option>
          <option value="pending">Pending</option>
          <option value="confirmed">Confirmed</option>
          <option value="cancelled">Cancelled</option>
          <option value="refunded">Refunded</option>
        </select>
        <select
          aria-label="Payment status"
          id="AdminOrdersPage-payment-status"
          value={paymentStatusFilter}
          onChange={(e) => {
            setPaymentStatusFilter(e.target.value);
            setPage(1);
          }}
          className="px-3 py-2.5 text-sm border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
        >
          <option value="all">All Payment Status</option>
          <option value="pending">Pending</option>
          <option value="paid">Paid</option>
          <option value="failed">Failed</option>
          <option value="refund_pending">Refund Pending</option>
          <option value="refunded">Refunded</option>
        </select>
      </div>

      <ScrollRegion
        label="Orders table"
        className="bg-white border border-slate-100 rounded-xl  mb-4"
      >
        <table className="w-full min-w-[680px] text-sm">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100">
              <th
                scope="col"
                className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wide"
              >
                Order ID
              </th>
              <th
                scope="col"
                className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wide"
              >
                Customer
              </th>
              <th
                scope="col"
                className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wide"
              >
                Date
              </th>
              <th
                scope="col"
                className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wide"
              >
                Amount
              </th>
              <th
                scope="col"
                className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wide"
              >
                Order Status
              </th>
              <th
                scope="col"
                className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wide"
              >
                Payment
              </th>
              <th
                scope="col"
                className="text-right px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wide"
              >
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {paginated.map((order) => (
              <tr key={order.id} className="hover:bg-slate-50/50 transition-colors">
                <td className="px-5 py-3.5">
                  <span className="font-mono text-xs font-semibold text-indigo-600">
                    {order.id}
                  </span>
                </td>
                <td className="px-5 py-3.5">
                  <p className="text-sm font-medium text-slate-900">{order.customerName}</p>
                  <p className="text-xs text-slate-500">{order.customerEmail}</p>
                </td>
                <td className="px-5 py-3.5 text-xs text-slate-500">
                  {new Date(order.createdAt).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </td>
                <td className="px-5 py-3.5 font-semibold text-slate-900">
                  ${order.total.toFixed(2)}
                </td>
                <td className="px-5 py-3.5">
                  <OrderStatusBadge status={order.orderStatus} />
                </td>
                <td className="px-5 py-3.5">
                  <PaymentStatusBadge status={order.paymentStatus} />
                </td>
                <td className="px-5 py-3.5 text-right">
                  <button
                    onClick={() => setDetailOrder(order.id)}
                    className="text-xs text-indigo-600 hover:text-indigo-800 font-medium px-2 py-1 hover:bg-indigo-50 rounded-lg transition-colors"
                  >
                    View Details
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </ScrollRegion>
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500">{filtered.length} orders</p>
        <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
      </div>

      {/* Order detail modal */}
      <Modal
        open={!!detailOrder}
        onClose={() => setDetailOrder(null)}
        title={`Order ${viewOrder?.id ?? ''}`}
        size="lg"
      >
        {viewOrder && (
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: 'Customer', value: viewOrder.customerName },
                { label: 'Email', value: viewOrder.customerEmail },
                {
                  label: 'Order Status',
                  value: <OrderStatusBadge status={viewOrder.orderStatus} size="md" />,
                },
                {
                  label: 'Payment',
                  value: <PaymentStatusBadge status={viewOrder.paymentStatus} size="md" />,
                },
                { label: 'Total', value: `$${viewOrder.total.toFixed(2)}` },
                {
                  label: 'Date',
                  value: new Date(viewOrder.createdAt).toLocaleString(),
                },
              ].map(({ label, value }) => (
                <div key={label}>
                  <p className="text-xs text-slate-500 mb-0.5">{label}</p>
                  <p className="text-sm font-medium text-slate-800">{value}</p>
                </div>
              ))}
            </div>
            <div className="border-t border-slate-100 pt-3">
              <p className="text-xs font-semibold text-slate-500 mb-2">ITEMS</p>
              {viewOrder.items.map((item) => (
                <div key={item.productId} className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 rounded bg-slate-100 overflow-hidden shrink-0">
                    <img
                      src={item.imageUrl}
                      alt={item.productName}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <span className="text-sm text-slate-700 flex-1">
                    {item.productName} ×{item.quantity}
                  </span>
                  <span className="text-sm font-semibold text-slate-900">
                    ${(item.price * item.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
            {viewOrder.orderStatus === 'pending' && (
              <div className="flex gap-3 pt-2 border-t border-slate-100">
                <Button
                  size="sm"
                  onClick={() => {
                    confirmOrder(viewOrder.id);
                    setDetailOrder(null);
                  }}
                >
                  Confirm Order
                </Button>
                <Button
                  size="sm"
                  variant="danger"
                  onClick={() => {
                    cancelOrder(viewOrder.id);
                    setDetailOrder(null);
                  }}
                >
                  Cancel Order
                </Button>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
