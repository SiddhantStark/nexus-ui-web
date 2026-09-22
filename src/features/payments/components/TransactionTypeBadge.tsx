import Badge, { type BadgeTone, type BadgeStyleProps } from '@/shared/ui/Badge';
import type { TransactionType } from '../types';
const CONFIG: Record<TransactionType, { label: string; tone: BadgeTone }> = {
  payment: { label: 'Payment', tone: 'indigo' },
  refund: { label: 'Refund', tone: 'violet' },
};
export default function TransactionTypeBadge({
  status,
  size,
}: BadgeStyleProps & { status: TransactionType }) {
  return <Badge {...CONFIG[status]} size={size} />;
}
