import Badge, { type BadgeTone, type BadgeStyleProps } from '@/shared/ui/Badge';
type Status = 'active' | 'low_stock' | 'out_of_stock';
const CONFIG: Record<Status, { label: string; tone: BadgeTone }> = {
  active: { label: 'Active', tone: 'positive' },
  low_stock: { label: 'Low Stock', tone: 'warning' },
  out_of_stock: { label: 'Out of Stock', tone: 'muted' },
};
export default function StockStatusBadge({ status, size }: BadgeStyleProps & { status: Status }) {
  return <Badge {...CONFIG[status]} size={size} />;
}
