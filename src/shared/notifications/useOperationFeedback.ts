import type { Outcome } from '@/shared/lib/outcome';
import { useNotificationActions } from './NotificationProvider';
export function useOperationFeedback() {
  const { addToast } = useNotificationActions();
  return (result: Outcome, message: string): boolean => {
    addToast(result.success ? message : result.error, result.success ? 'success' : 'error');
    return result.success;
  };
}
