import ScrollRegion from '@/shared/ui/ScrollRegion';
import { usePagination } from '@/shared/hooks/usePagination';
import TransactionTypeBadge from '@/features/payments/components/TransactionTypeBadge';
import TransactionStatusBadge from '@/features/payments/components/TransactionStatusBadge';
import { usePayments } from '@/features/payments/usePayments';
import { useState } from 'react';
import Pagination from '@/shared/ui/Pagination';

const PER_PAGE = 10;

export default function AdminTransactionsPage() {
  const { transactions } = usePayments();
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');

  const filtered = transactions.filter((t) => {
    const matchSearch =
      t.id.toLowerCase().includes(search.toLowerCase()) ||
      t.orderId.toLowerCase().includes(search.toLowerCase()) ||
      t.customerName.toLowerCase().includes(search.toLowerCase());
    const matchType = typeFilter === 'all' || t.type === typeFilter;
    const matchStatus = statusFilter === 'all' || t.status === statusFilter;
    return matchSearch && matchType && matchStatus;
  });

  const { page, totalPages, setPage } = usePagination(filtered.length, PER_PAGE);
  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const totalVolume = transactions
    .filter((t) => t.status === 'success')
    .reduce((s, t) => s + t.amount, 0);

  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Transactions</h1>
        <p className="text-sm text-slate-500 mt-0.5">
          {transactions.length} transactions · Total volume: ${totalVolume.toFixed(2)}
        </p>
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
            aria-label="Search transactions"
            id="AdminTransactionsPage-search-transactions"
            placeholder="Search by ID, order, or customer…"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full pl-9 pr-3 py-2.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {['all', 'payment', 'refund'].map((f) => (
            <button
              key={f}
              onClick={() => {
                setTypeFilter(f);
                setPage(1);
              }}
              className={`px-3 py-2 text-xs rounded-lg border font-medium transition-colors ${
                typeFilter === f
                  ? 'bg-indigo-600 text-white border-indigo-600'
                  : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
              }`}
            >
              {f === 'all' ? 'All Types' : f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          {['all', 'success', 'failed', 'pending'].map((f) => (
            <button
              key={f}
              onClick={() => {
                setStatusFilter(f);
                setPage(1);
              }}
              className={`px-3 py-2 text-xs rounded-lg border font-medium transition-colors ${
                statusFilter === f
                  ? 'bg-indigo-600 text-white border-indigo-600'
                  : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
              }`}
            >
              {f === 'all' ? 'All Status' : f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <ScrollRegion
        label="Transactions table"
        className="bg-white border border-slate-100 rounded-xl  mb-4"
      >
        <table className="w-full min-w-[680px] text-sm">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100">
              <th
                scope="col"
                className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wide"
              >
                Transaction ID
              </th>
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
                Type
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
                Status
              </th>
              <th
                scope="col"
                className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wide"
              >
                Date
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {paginated.map((tx) => (
              <tr key={tx.id} className="hover:bg-slate-50/50 transition-colors">
                <td className="px-5 py-4">
                  <span className="font-mono text-xs font-semibold text-indigo-600">{tx.id}</span>
                </td>
                <td className="px-5 py-4">
                  <span className="font-mono text-xs text-slate-600">{tx.orderId}</span>
                </td>
                <td className="px-5 py-4">
                  <p className="text-sm font-medium text-slate-900">{tx.customerName}</p>
                  <p className="text-xs text-slate-500">{tx.method}</p>
                </td>
                <td className="px-5 py-4">
                  <TransactionTypeBadge status={tx.type} />
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
                  <TransactionStatusBadge status={tx.status} />
                </td>
                <td className="px-5 py-4 text-xs text-slate-500">
                  {new Date(tx.createdAt).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                  <br />
                  <span className="text-slate-500">
                    {new Date(tx.createdAt).toLocaleTimeString('en-US', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </ScrollRegion>
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500">{filtered.length} transactions</p>
        <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
      </div>
    </div>
  );
}
