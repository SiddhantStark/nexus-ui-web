import { useRef } from 'react';
import { useNotifications } from '@/shared/notifications/NotificationProvider';
import type { Toast } from '@/shared/notifications/types';

function ToastItem({ toast }: { toast: Toast }) {
  const { removeToast, pauseToast, resumeToast } = useNotifications();
  const hovered = useRef(false);
  const icons = {
    success: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        className="w-4 h-4 text-emerald-500 shrink-0"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    ),
    error: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        className="w-4 h-4 text-red-500 shrink-0"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
        />
      </svg>
    ),
    warning: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        className="w-4 h-4 text-amber-500 shrink-0"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
        />
      </svg>
    ),
    info: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        className="w-4 h-4 text-blue-500 shrink-0"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z"
        />
      </svg>
    ),
  };

  return (
    <div
      onMouseEnter={() => {
        hovered.current = true;
        pauseToast(toast.id);
      }}
      onMouseLeave={(event) => {
        hovered.current = false;
        if (!event.currentTarget.contains(document.activeElement)) resumeToast(toast.id);
      }}
      onFocus={() => pauseToast(toast.id)}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget) && !hovered.current)
          resumeToast(toast.id);
      }}
      className="flex items-start gap-3 bg-white border border-slate-200 rounded-xl shadow-lg p-3.5 w-full min-w-0 animate-slide-in"
    >
      {icons[toast.type]}
      <p
        role={toast.type === 'error' ? 'alert' : 'status'}
        aria-atomic="true"
        className="text-sm text-slate-800 flex-1 min-w-0 break-words leading-snug"
      >
        {toast.message}
      </p>
      <button
        type="button"
        aria-label="Dismiss notification"
        onClick={() => removeToast(toast.id)}
        className="text-slate-600 hover:text-slate-900 p-1 shrink-0"
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className="w-3.5 h-3.5"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}

export default function ToastContainer() {
  const { toasts } = useNotifications();
  if (!toasts.length) return null;
  return (
    <section
      aria-label="Notifications"
      className="fixed bottom-4 right-4 z-[100] w-[calc(100%_-_2rem)] max-w-sm max-h-[50dvh] overflow-y-auto flex flex-col gap-2"
    >
      {toasts.map((t) => (
        <ToastItem key={t.id} toast={t} />
      ))}
    </section>
  );
}
