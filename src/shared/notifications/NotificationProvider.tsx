import {
  createContext,
  useContext,
  useState,
  useCallback,
  useRef,
  useEffect,
  useMemo,
  type ReactNode,
} from 'react';
import type { Toast } from './types';
function useNotificationState() {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const timers = useRef(new Map<string, ReturnType<typeof setTimeout>>());
  const active = useRef(new Map<string, Toast['type']>());
  useEffect(() => {
    const activeTimers = timers.current;
    return () => {
      activeTimers.forEach(clearTimeout);
      activeTimers.clear();
    };
  }, []);
  const removeToast = useCallback((id: string) => {
    clearTimeout(timers.current.get(id));
    timers.current.delete(id);
    active.current.delete(id);
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);
  const pauseToast = useCallback((id: string) => {
    clearTimeout(timers.current.get(id));
    timers.current.delete(id);
  }, []);
  const resumeToast = useCallback(
    (id: string) => {
      pauseToast(id);
      if (!active.current.has(id) || active.current.get(id) === 'error') return;
      timers.current.set(
        id,
        setTimeout(() => removeToast(id), 8000),
      );
    },
    [pauseToast, removeToast],
  );
  const addToast = useCallback(
    (message: string, type: Toast['type'] = 'info') => {
      const id = crypto.randomUUID();
      active.current.set(id, type);
      setToasts((previous) => [...previous, { id, message, type }]);
      resumeToast(id);
    },
    [resumeToast],
  );
  return { toasts, addToast, removeToast, pauseToast, resumeToast };
}
const NotificationContext = createContext<ReturnType<typeof useNotificationState> | null>(null);
type NotificationActions = Pick<
  ReturnType<typeof useNotificationState>,
  'addToast' | 'removeToast'
>;
const NotificationActionsContext = createContext<NotificationActions | null>(null);
export default function NotificationProvider({ children }: { children: ReactNode }) {
  const value = useNotificationState();
  const actions = useMemo(
    () => ({ addToast: value.addToast, removeToast: value.removeToast }),
    [value.addToast, value.removeToast],
  );
  return (
    <NotificationActionsContext.Provider value={actions}>
      <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>
    </NotificationActionsContext.Provider>
  );
}
export function useNotifications() {
  const value = useContext(NotificationContext);
  if (!value) throw new Error('useNotifications requires NotificationProvider');
  return value;
}

export function useNotificationActions() {
  const value = useContext(NotificationActionsContext);
  if (!value) throw new Error('useNotificationActions requires NotificationProvider');
  return value;
}
