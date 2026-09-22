import Badge, { type BadgeTone, type BadgeStyleProps } from '@/shared/ui/Badge';
import type { OrderStatus } from '../types';
const CONFIG: Record<OrderStatus, { label: string; tone: BadgeTone }> = {
  pending: { label: 'Pending', tone: 'warning' },
  confirmed: { label: 'Confirmed', tone: 'positive' },
  cancelled: { label: 'Cancelled', tone: 'muted' },
  refunded: { label: 'Refunded', tone: 'violet' },
};
export default function OrderStatusBadge({
  status,
  size,
}: BadgeStyleProps & { status: OrderStatus }) {
  return <Badge {...CONFIG[status]} size={size} />;
}
