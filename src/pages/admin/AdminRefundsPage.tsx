import { useState } from 'react';
import { useApp } from '../../context/AppContext';
import StatusBadge from '../../components/ui/StatusBadge';
import Pagination from '../../components/ui/Pagination';
import ConfirmDialog from '../../components/ui/ConfirmDialog';

const PER_PAGE = 8;

export default function AdminRefundsPage() {
  const { refunds, resolveRefund } = useApp();
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [approveTarget, setApproveTarget] = useState<string | null>(null);
  const [rejectTarget, setRejectTarget] = useState<string | null>(null);

  const filtered = refunds.filter((r) => {
    const matchSearch =
      r.id.toLowerCase().includes(search.toLowerCase()) ||
      r.orderId.toLowerCase().includes(search.toLowerCase()) ||
      r.customerName.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || r.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const approveRefund = refunds.find((r) => r.id === approveTarget);
  const rejectRefund = refunds.find((r) => r.id === rejectTarget);

  function handleApprove() {
    if (approveRefund && resolveRefund(approveRefund.id, 'completed')) setApproveTarget(null);
  }
  function handleReject() {
    if (rejectRefund && resolveRefund(rejectRefund.id, 'rejected')) setRejectTarget(null);
  }

  const totalPending = refunds
    .filter((r) => r.status === 'pending')
    .reduce((s, r) => s + r.amount, 0);

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Refunds</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            {refunds.length} refund requests · Pending: ${totalPending.toFixed(2)}
          </p>
        </div>
      </div>

      {/* Status counts */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        {[
          {
            status: 'pending',
            label: 'Pending',
            count: refunds.filter((r) => r.status === 'pending').length,
            color: 'bg-amber-50 text-amber-700 border-amber-100',
          },
          {
            status: 'processing',
            label: 'Processing',
            count: refunds.filter((r) => r.status === 'processing').length,
            color: 'bg-cyan-50 text-cyan-700 border-cyan-100',
          },
          {
            status: 'completed',
            label: 'Completed',
            count: refunds.filter((r) => r.status === 'completed').length,
            color: 'bg-emerald-50 text-emerald-700 border-emerald-100',
          },
          {
            status: 'rejected',
            label: 'Rejected',
            count: refunds.filter((r) => r.status === 'rejected').length,
            color: 'bg-slate-100 text-slate-700 border-slate-200',
          },
          {
            status: 'failed',
            label: 'Failed',
            count: refunds.filter((r) => r.status === 'failed').length,
            color: 'bg-red-50 text-red-700 border-red-100',
          },
        ].map(({ status, label, count, color }) => (
          <button
            key={status}
            onClick={() => {
              setStatusFilter(statusFilter === status ? 'all' : status);
              setPage(1);
            }}
            className={`${color} border rounded-xl p-4 text-center transition-all hover:shadow-sm ${
              statusFilter === status ? 'ring-2 ring-offset-1 ring-indigo-400' : ''
            }`}
          >
            <p className="text-xl font-bold">{count}</p>
            <p className="text-xs font-medium mt-0.5">{label}</p>
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="bg-white border border-slate-100 rounded-xl p-4 mb-4">
        <div className="relative max-w-md">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
            />
          </svg>
          <input
            placeholder="Search by refund ID, order, or customer…"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full pl-9 pr-3 py-2.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400"
          />
        </div>
      </div>

      <div className="bg-white border border-slate-100 rounded-xl overflow-hidden mb-4">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100">
              <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                Refund ID
              </th>
              <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                Order ID
              </th>
              <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                Customer
              </th>
              <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                Amount
              </th>
              <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                Status
              </th>
              <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                Requested
              </th>
              <th className="text-right px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {paginated.map((refund) => (
              <tr key={refund.id} className="hover:bg-slate-50/50 transition-colors">
                <td className="px-5 py-4">
                  <span className="font-mono text-xs font-semibold text-indigo-600">
                    {refund.id}
                  </span>
                </td>
                <td className="px-5 py-4">
                  <span className="font-mono text-xs text-slate-600">{refund.orderId}</span>
                </td>
                <td className="px-5 py-4">
                  <p className="text-sm font-medium text-slate-900">{refund.customerName}</p>
                  {refund.reason && (
                    <p className="text-xs text-slate-400 truncate max-w-32">{refund.reason}</p>
                  )}
                </td>
                <td className="px-5 py-4 font-semibold text-slate-900">
                  ${refund.amount.toFixed(2)}
                </td>
                <td className="px-5 py-4">
                  <StatusBadge status={refund.status} />
                </td>
                <td className="px-5 py-4 text-xs text-slate-500">
                  {new Date(refund.requestedAt).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </td>
                <td className="px-5 py-4">
                  {refund.status === 'pending' && (
                    <div className="flex items-center gap-2 justify-end">
                      <button
                        onClick={() => setApproveTarget(refund.id)}
                        className="text-xs text-emerald-600 hover:text-emerald-800 font-medium px-2 py-1 hover:bg-emerald-50 rounded-lg transition-colors"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => setRejectTarget(refund.id)}
                        className="text-xs text-red-600 hover:text-red-800 font-medium px-2 py-1 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        Reject
                      </button>
                    </div>
                  )}
                  {refund.status === 'processing' && (
                    <button
                      onClick={() => {
                        resolveRefund(refund.id, 'completed');
                      }}
                      className="text-xs text-cyan-600 hover:text-cyan-800 font-medium px-2 py-1 hover:bg-cyan-50 rounded-lg transition-colors"
                    >
                      Mark Complete
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500">{filtered.length} refunds</p>
        <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
      </div>

      <ConfirmDialog
        open={!!approveTarget}
        title="Approve refund?"
        message={`Process a refund of $${approveRefund?.amount.toFixed(2)} for ${approveRefund?.customerName}. This records a simulated reversal; no real money is moved.`}
        confirmLabel="Approve Refund"
        variant="primary"
        onConfirm={handleApprove}
        onCancel={() => setApproveTarget(null)}
      />

      <ConfirmDialog
        open={!!rejectTarget}
        title="Reject refund request?"
        message={`Refund request ${rejectRefund?.id} for $${rejectRefund?.amount.toFixed(2)} will be rejected. The demo payment returns to paid; no message is sent.`}
        confirmLabel="Reject Request"
        variant="danger"
        onConfirm={handleReject}
        onCancel={() => setRejectTarget(null)}
      />
    </div>
  );
}
