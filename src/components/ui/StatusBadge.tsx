interface StatusBadgeProps {
  status: string;
  size?: 'sm' | 'md';
}

const STATUS_CONFIG: Record<
  string,
  {
    label: string;
    bg: string;
    text: string;
    dot: string;
  }
> = {
  pending: {
    label: 'Pending',
    bg: 'bg-amber-50',
    text: 'text-amber-700',
    dot: 'bg-amber-400',
  },
  confirmed: {
    label: 'Confirmed',
    bg: 'bg-emerald-50',
    text: 'text-emerald-700',
    dot: 'bg-emerald-400',
  },
  paid: {
    label: 'Paid',
    bg: 'bg-emerald-50',
    text: 'text-emerald-700',
    dot: 'bg-emerald-400',
  },
  failed: {
    label: 'Failed',
    bg: 'bg-red-50',
    text: 'text-red-700',
    dot: 'bg-red-400',
  },
  cancelled: {
    label: 'Cancelled',
    bg: 'bg-slate-100',
    text: 'text-slate-600',
    dot: 'bg-slate-400',
  },
  refund_pending: {
    label: 'Refund Pending',
    bg: 'bg-blue-50',
    text: 'text-blue-700',
    dot: 'bg-blue-400',
  },
  refunded: {
    label: 'Refunded',
    bg: 'bg-violet-50',
    text: 'text-violet-700',
    dot: 'bg-violet-400',
  },
  out_of_stock: {
    label: 'Out of Stock',
    bg: 'bg-slate-100',
    text: 'text-slate-600',
    dot: 'bg-slate-400',
  },
  success: {
    label: 'Success',
    bg: 'bg-emerald-50',
    text: 'text-emerald-700',
    dot: 'bg-emerald-400',
  },
  processing: {
    label: 'Processing',
    bg: 'bg-cyan-50',
    text: 'text-cyan-700',
    dot: 'bg-cyan-400',
  },
  completed: {
    label: 'Completed',
    bg: 'bg-emerald-50',
    text: 'text-emerald-700',
    dot: 'bg-emerald-400',
  },
  payment: {
    label: 'Payment',
    bg: 'bg-indigo-50',
    text: 'text-indigo-700',
    dot: 'bg-indigo-400',
  },
  refund: {
    label: 'Refund',
    bg: 'bg-violet-50',
    text: 'text-violet-700',
    dot: 'bg-violet-400',
  },
  active: {
    label: 'Active',
    bg: 'bg-emerald-50',
    text: 'text-emerald-700',
    dot: 'bg-emerald-400',
  },
  inactive: {
    label: 'Inactive',
    bg: 'bg-slate-100',
    text: 'text-slate-600',
    dot: 'bg-slate-400',
  },
  low_stock: {
    label: 'Low Stock',
    bg: 'bg-amber-50',
    text: 'text-amber-700',
    dot: 'bg-amber-400',
  },
};

export default function StatusBadge({ status, size = 'sm' }: StatusBadgeProps) {
  const config = STATUS_CONFIG[status] ?? {
    label: status,
    bg: 'bg-slate-100',
    text: 'text-slate-600',
    dot: 'bg-slate-400',
  };
  const padding = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm';
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-medium ${config.bg} ${config.text} ${padding}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
      {config.label}
    </span>
  );
}
