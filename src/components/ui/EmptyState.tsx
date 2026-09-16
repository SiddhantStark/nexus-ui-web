import type { ReactNode } from 'react';
import Button from './Button';

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: { label: string; onClick: () => void };
}

const DefaultIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    className="w-10 h-10 text-slate-300"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z"
    />
  </svg>
);

export default function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="w-20 h-20 bg-slate-50 rounded-2xl flex items-center justify-center mb-4">
        {icon ?? <DefaultIcon />}
      </div>
      <h3 className="text-base font-semibold text-slate-800 mb-1">{title}</h3>
      {description && <p className="text-sm text-slate-500 max-w-xs">{description}</p>}
      {action && (
        <div className="mt-5">
          <Button size="sm" onClick={action.onClick}>
            {action.label}
          </Button>
        </div>
      )}
    </div>
  );
}

export function SkeletonCard() {
  return (
    <div className="bg-white rounded-xl border border-slate-100 p-4 animate-pulse">
      <div className="bg-slate-100 rounded-lg h-40 mb-4" />
      <div className="bg-slate-100 rounded h-4 mb-2 w-3/4" />
      <div className="bg-slate-100 rounded h-3 mb-3 w-1/2" />
      <div className="bg-slate-100 rounded h-8 w-24" />
    </div>
  );
}

export function SkeletonRow() {
  return (
    <tr className="animate-pulse">
      {Array.from({ length: 6 }).map((_, i) => (
        <td key={i} className="px-4 py-3">
          <div className="bg-slate-100 rounded h-4 w-full" />
        </td>
      ))}
    </tr>
  );
}
