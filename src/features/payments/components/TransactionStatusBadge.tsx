import Badge, { type BadgeTone, type BadgeStyleProps } from '@/shared/ui/Badge';
import type { TransactionStatus } from '../types';
const CONFIG: Record<TransactionStatus, { label: string; tone: BadgeTone }> = {
  pending: { label: 'Pending', tone: 'warning' },
  success: { label: 'Success', tone: 'positive' },
  failed: { label: 'Failed', tone: 'negative' },
};
export default function TransactionStatusBadge({
  status,
  size,
}: BadgeStyleProps & { status: TransactionStatus }) {
  return <Badge {...CONFIG[status]} size={size} />;
}
