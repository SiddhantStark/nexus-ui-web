import { useState } from 'react';
import { useApp, useMyTransactions } from '../../context/AppContext';
import StatusBadge from '../../components/ui/StatusBadge';
import Breadcrumbs from '../../components/ui/Breadcrumbs';
import EmptyState from '../../components/ui/EmptyState';
import Pagination from '../../components/ui/Pagination';

const PER_PAGE = 8;

export default function TransactionHistoryPage() {
  const { navigate } = useApp();
  const transactions = useMyTransactions();
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);

  const filtered = transactions.filter((t) => {
    if (typeFilter !== 'all' && t.type !== typeFilter) return false;
    if (statusFilter !== 'all' && t.status !== statusFilter) return false;
    return true;
  });

  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const totalPaid = transactions
    .filter((t) => t.type === 'payment' && t.status === 'success')
    .reduce((s, t) => s + t.amount, 0);
  const totalRefunded = transactions
    .filter((t) => t.type === 'refund' && t.status === 'success')
    .reduce((s, t) => s + t.amount, 0);

  return (
    <div className="max-w-5xl mx-auto px-6 py-8 animate-fade-in">
      <Breadcrumbs crumbs={[{ label: 'Home', page: 'home' }, { label: 'Transaction History' }]} />
      <h1 className="text-2xl font-bold text-slate-900 mb-6">Transaction History</h1>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          {
            label: 'Total Spent',
            value: `$${totalPaid.toFixed(2)}`,
            color: 'text-slate-900',
            bg: 'bg-white',
          },
          {
            label: 'Total Refunded',
            value: `$${totalRefunded.toFixed(2)}`,
            color: 'text-violet-700',
            bg: 'bg-violet-50',
          },
          {
            label: 'Net Spent',
            value: `$${(totalPaid - totalRefunded).toFixed(2)}`,
            color: 'text-indigo-700',
            bg: 'bg-indigo-50',
          },
        ].map(({ label, value, color, bg }) => (
          <div key={label} className={`${bg} border border-slate-100 rounded-xl p-4`}>
            <p className="text-xs text-slate-500 mb-1">{label}</p>
            <p className={`text-xl font-bold ${color}`}>{value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white border border-slate-100 rounded-xl p-4 mb-5 flex flex-wrap gap-3 items-center">
        <div className="flex gap-2">
          <span className="text-xs font-medium text-slate-500 self-center">Type:</span>
          {['all', 'payment', 'refund'].map((f) => (
            <button
              key={f}
              onClick={() => {
                setTypeFilter(f);
                setPage(1);
              }}
              className={`px-3 py-1 text-xs rounded-lg border font-medium transition-colors ${
                typeFilter === f
                  ? 'bg-indigo-600 text-white border-indigo-600'
                  : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
              }`}
            >
              {f === 'all' ? 'All' : f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <span className="text-xs font-medium text-slate-500 self-center">Status:</span>
          {['all', 'success', 'failed', 'pending'].map((f) => (
            <button
              key={f}
              onClick={() => {
                setStatusFilter(f);
                setPage(1);
              }}
              className={`px-3 py-1 text-xs rounded-lg border font-medium transition-colors ${
                statusFilter === f
                  ? 'bg-indigo-600 text-white border-indigo-600'
                  : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
              }`}
            >
              {f === 'all' ? 'All' : f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {paginated.length === 0 ? (
        <EmptyState
          title="No transactions found"
          description="Your transaction history will appear here."
        />
      ) : (
        <>
          <div className="bg-white border border-slate-100 rounded-xl overflow-hidden mb-4">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                    Transaction ID
                  </th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                    Order
                  </th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                    Type
                  </th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                    Amount
                  </th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                    Status
                  </th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {paginated.map((tx) => (
                  <tr key={tx.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-5 py-4">
                      <span className="font-mono text-xs text-indigo-600 font-medium">{tx.id}</span>
                    </td>
                    <td className="px-5 py-4">
                      <button
                        className="font-mono text-xs text-slate-600 hover:text-indigo-600 transition-colors"
                        onClick={() => navigate('order-detail', { orderId: tx.orderId })}
                      >
                        {tx.orderId}
                      </button>
                    </td>
                    <td className="px-5 py-4">
                      <StatusBadge status={tx.type} />
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`text-sm font-bold ${
                          tx.type === 'refund' ? 'text-violet-700' : 'text-slate-900'
                        }`}
                      >
                        {tx.type === 'refund' ? '+' : ''}${tx.amount.toFixed(2)}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <StatusBadge status={tx.status} />
                    </td>
                    <td className="px-5 py-4 text-xs text-slate-500">
                      {new Date(tx.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-500">
              {filtered.length} transaction{filtered.length !== 1 ? 's' : ''}
            </p>
            <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
          </div>
        </>
      )}
    </div>
  );
}
