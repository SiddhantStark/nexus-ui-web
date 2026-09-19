import LinkButton from '../../components/ui/LinkButton';
import { Link } from 'react-router';
import { useState } from 'react';
import { useMyOrders } from '../../context/AppContext';
import StatusBadge from '../../components/ui/StatusBadge';
import EmptyState from '../../components/ui/EmptyState';
import Breadcrumbs from '../../components/ui/Breadcrumbs';
import Pagination from '../../components/ui/Pagination';

const PER_PAGE = 5;

export default function MyOrdersPage() {
  const orders = useMyOrders();
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('all');

  const filtered =
    statusFilter === 'all'
      ? orders
      : orders.filter((o) => o.orderStatus === statusFilter || o.paymentStatus === statusFilter);
  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  return (
    <div className="max-w-5xl mx-auto px-6 py-8 animate-fade-in">
      <Breadcrumbs crumbs={[{ label: 'Home', to: '/' }, { label: 'My Orders' }]} />
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">My Orders</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            {orders.length} order{orders.length !== 1 ? 's' : ''} total
          </p>
        </div>
        <LinkButton variant="outline" size="sm" to={'/transactions'}>
          View Transactions
        </LinkButton>
      </div>

      {/* Status filter */}
      <div className="flex gap-2 flex-wrap mb-5">
        {[
          { id: 'all', label: 'All Orders' },
          { id: 'pending', label: 'Pending' },
          { id: 'confirmed', label: 'Confirmed' },
          { id: 'cancelled', label: 'Cancelled' },
          { id: 'refunded', label: 'Refunded' },
        ].map((f) => (
          <button
            key={f.id}
            onClick={() => {
              setStatusFilter(f.id);
              setPage(1);
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
              statusFilter === f.id
                ? 'bg-indigo-600 text-white border-indigo-600'
                : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {paginated.length === 0 ? (
        <EmptyState
          title="No orders found"
          description="Place your first order to see it here."
          action={{
            label: 'Start Shopping',
            to: '/products',
          }}
        />
      ) : (
        <div className="flex flex-col gap-3">
          {paginated.map((order) => (
            <div
              key={order.id}
              className="relative bg-white border border-slate-100 rounded-xl p-5 hover:shadow-sm hover:border-slate-200 transition-all cursor-pointer"
            >
              <Link
                aria-label={`View order ${order.id}`}
                className="absolute inset-0 z-10 rounded-xl focus-visible:outline-2 focus-visible:outline-indigo-600"
                to={`/orders/${encodeURIComponent(order.id)}`}
              />
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div className="flex items-start gap-4">
                  {/* Thumbnails */}
                  <div className="flex -space-x-2">
                    {order.items.slice(0, 3).map((item) => (
                      <div
                        key={item.productId}
                        className="w-10 h-10 rounded-lg overflow-hidden border-2 border-white bg-slate-100 shrink-0"
                      >
                        <img
                          src={item.imageUrl}
                          alt={item.productName}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                    {order.items.length > 3 && (
                      <div className="w-10 h-10 rounded-lg bg-slate-100 border-2 border-white flex items-center justify-center text-xs font-medium text-slate-600">
                        +{order.items.length - 3}
                      </div>
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-0.5">
                      <p className="font-bold text-slate-900 font-mono text-sm">{order.id}</p>
                    </div>
                    <p className="text-xs text-slate-500">
                      {new Date(order.createdAt).toLocaleDateString('en-US', {
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {order.items.length} item
                      {order.items.length !== 1 ? 's' : ''} · {order.paymentMethod}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4 flex-wrap">
                  <div className="flex flex-col gap-1.5">
                    <StatusBadge status={order.orderStatus} />
                    <StatusBadge status={order.paymentStatus} />
                  </div>
                  <div className="text-right">
                    <p className="text-base font-bold text-slate-900">${order.total.toFixed(2)}</p>
                    <LinkButton
                      variant="outline"
                      size="sm"
                      to={`/orders/${encodeURIComponent(order.id)}`}
                      onClick={(e) => {
                        e.stopPropagation();
                      }}
                      className="relative z-20 mt-1 text-xs"
                    >
                      View Details
                    </LinkButton>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex justify-center mt-6">
          <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
        </div>
      )}
    </div>
  );
}
