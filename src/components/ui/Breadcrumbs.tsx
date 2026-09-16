import { useApp } from '../../context/AppContext';
import type { PageName, NavigationParams } from '../../types';

interface Crumb {
  label: string;
  page?: PageName;
  params?: NavigationParams;
}

interface BreadcrumbsProps {
  crumbs: Crumb[];
}

export default function Breadcrumbs({ crumbs }: BreadcrumbsProps) {
  const { navigate } = useApp();
  return (
    <nav className="flex items-center gap-1.5 text-sm text-slate-500 mb-5">
      {crumbs.map((crumb, idx) => (
        <span key={idx} className="flex items-center gap-1.5">
          {idx > 0 && (
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="w-3.5 h-3.5 text-slate-300"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
            </svg>
          )}
          {crumb.page && idx < crumbs.length - 1 ? (
            <button
              onClick={() => navigate(crumb.page!, crumb.params)}
              className="hover:text-indigo-600 transition-colors font-medium"
            >
              {crumb.label}
            </button>
          ) : (
            <span className={idx === crumbs.length - 1 ? 'text-slate-900 font-medium' : ''}>
              {crumb.label}
            </span>
          )}
        </span>
      ))}
    </nav>
  );
}
