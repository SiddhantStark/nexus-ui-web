import Badge, { type BadgeTone, type BadgeStyleProps } from '@/shared/ui/Badge';
import type { RefundStatus } from '../types';
const CONFIG: Record<RefundStatus, { label: string; tone: BadgeTone }> = {
  pending: { label: 'Pending', tone: 'warning' },
  processing: { label: 'Processing', tone: 'cyan' },
  completed: { label: 'Completed', tone: 'positive' },
  failed: { label: 'Failed', tone: 'negative' },
  rejected: { label: 'Rejected', tone: 'neutral' },
};
export default function RefundStatusBadge({
  status,
  size,
}: BadgeStyleProps & { status: RefundStatus }) {
  return <Badge {...CONFIG[status]} size={size} />;
}
