import OrderStatusBadge from '@/features/orders/components/OrderStatusBadge';
import PaymentStatusBadge from '@/features/payments/components/PaymentStatusBadge';
import TransactionStatusBadge from '@/features/payments/components/TransactionStatusBadge';
import { useDashboard } from '@/features/dashboard/useDashboard';

function StatCard({
  label,
  value,
  sub,
  icon,
  color,
}: {
  label: string;
  value: string | number;
  sub?: string;
  icon: React.ReactNode;
  color: string;
}) {
  return (
    <div className="bg-white border border-slate-100 rounded-xl p-5">
      <div className="flex items-start justify-between mb-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
          {icon}
        </div>
      </div>
      <p
        className="text-2xl font-extrabold text-slate-900 mb-0.5"
        style={{ fontFamily: "'Outfit', sans-serif" }}
      >
        {value}
      </p>
      <p className="text-sm font-medium text-slate-700">{label}</p>
      {sub && <p className="text-xs text-slate-500 mt-0.5">{sub}</p>}
    </div>
  );
}

export default function AdminDashboard() {
  const { orders, transactions, refunds, products } = useDashboard();

  const totalRevenue = transactions
    .filter((t) => t.type === 'payment' && t.status === 'success')
    .reduce((s, t) => s + t.amount, 0);
  const successPayments = transactions.filter(
    (t) => t.type === 'payment' && t.status === 'success',
  ).length;
  const failedPayments = transactions.filter(
    (t) => t.type === 'payment' && t.status === 'failed',
  ).length;
  const pendingRefunds = refunds.filter((r) => r.status === 'pending').length;
  const lowStock = products.filter((p) => p.stock > 0 && p.stock <= 5).length;

  const recentOrders = [...orders]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);
  const recentTxns = [...transactions]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);
  const lowStockProducts = products.filter((p) => p.stock <= 5);

  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-sm text-slate-500 mt-0.5">Overview of your store performance</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        <StatCard
          label="Total Orders"
          value={orders.length}
          sub="All time"
          icon={
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="w-5 h-5 text-indigo-600"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25z"
              />
            </svg>
          }
          color="bg-indigo-50"
        />
        <StatCard
          label="Total Revenue"
          value={`$${totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          sub="Confirmed payments"
          icon={
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="w-5 h-5 text-emerald-700"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75"
              />
            </svg>
          }
          color="bg-emerald-50"
        />
        <StatCard
          label="Successful Payments"
          value={successPayments}
          icon={
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="w-5 h-5 text-emerald-700"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          }
          color="bg-emerald-50"
        />
        <StatCard
          label="Failed Payments"
          value={failedPayments}
          icon={
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="w-5 h-5 text-red-600"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
              />
            </svg>
          }
          color="bg-red-50"
        />
        <StatCard
          label="Pending Refunds"
          value={pendingRefunds}
          icon={
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="w-5 h-5 text-amber-700"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3"
              />
            </svg>
          }
          color="bg-amber-50"
        />
        <StatCard
          label="Low Stock"
          value={lowStock}
          sub="Products"
          icon={
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="w-5 h-5 text-amber-700"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126z"
              />
            </svg>
          }
          color="bg-amber-50"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Recent Orders */}
        <div className="bg-white border border-slate-100 rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <h2 className="font-semibold text-slate-900 text-sm">Recent Orders</h2>
          </div>
          <div className="divide-y divide-slate-50">
            {recentOrders.map((order) => (
              <div
                key={order.id}
                className="px-5 py-3.5 flex items-center justify-between gap-3 hover:bg-slate-50/50"
              >
                <div className="min-w-0">
                  <p className="text-xs font-mono font-semibold text-indigo-600">{order.id}</p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {order.customerName} · ${order.total.toFixed(2)}
                  </p>
                </div>
                <div className="flex gap-1.5 shrink-0">
                  <OrderStatusBadge status={order.orderStatus} />
                  <PaymentStatusBadge status={order.paymentStatus} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="bg-white border border-slate-100 rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100">
            <h2 className="font-semibold text-slate-900 text-sm">Recent Transactions</h2>
          </div>
          <div className="divide-y divide-slate-50">
            {recentTxns.map((tx) => (
              <div
                key={tx.id}
                className="px-5 py-3.5 flex items-center justify-between gap-3 hover:bg-slate-50/50"
              >
                <div className="min-w-0">
                  <p className="text-xs font-mono font-semibold text-indigo-600">{tx.id}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{tx.customerName}</p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span
                    className={`text-sm font-bold ${
                      tx.type === 'refund' ? 'text-violet-600' : 'text-slate-900'
                    }`}
                  >
                    {tx.type === 'refund' ? '+' : ''}${tx.amount.toFixed(2)}
                  </span>
                  <TransactionStatusBadge status={tx.status} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Low stock warning */}
      {lowStockProducts.length > 0 && (
        <div className="bg-amber-50 border border-amber-100 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="w-4 h-4 text-amber-700"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126z"
              />
            </svg>
            <h2 className="text-sm font-semibold text-amber-800">Low Inventory Warning</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {lowStockProducts.map((p) => (
              <div
                key={p.id}
                className="flex items-center gap-3 bg-white rounded-lg p-3 border border-amber-100"
              >
                <div className="w-8 h-8 rounded-lg overflow-hidden bg-slate-100 shrink-0">
                  <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium text-slate-900 truncate">{p.name}</p>
                  <p className="text-xs text-amber-700 font-medium">
                    {p.stock === 0 ? 'Out of stock' : `${p.stock} remaining`}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
