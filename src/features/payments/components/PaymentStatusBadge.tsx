import Badge, { type BadgeTone, type BadgeStyleProps } from '@/shared/ui/Badge';
import type { PaymentStatus } from '../types';
const CONFIG: Record<PaymentStatus, { label: string; tone: BadgeTone }> = {
  pending: { label: 'Pending', tone: 'warning' },
  paid: { label: 'Paid', tone: 'positive' },
  failed: { label: 'Failed', tone: 'negative' },
  refund_pending: { label: 'Refund Pending', tone: 'info' },
  refunded: { label: 'Refunded', tone: 'violet' },
};
export default function PaymentStatusBadge({
  status,
  size,
}: BadgeStyleProps & { status: PaymentStatus }) {
  return <Badge {...CONFIG[status]} size={size} />;
}
