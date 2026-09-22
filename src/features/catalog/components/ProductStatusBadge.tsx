import Badge, { type BadgeTone, type BadgeStyleProps } from '@/shared/ui/Badge';
type Status = 'active' | 'inactive';
const CONFIG: Record<Status, { label: string; tone: BadgeTone }> = {
  active: { label: 'Active', tone: 'positive' },
  inactive: { label: 'Inactive', tone: 'muted' },
};
export default function ProductStatusBadge({ status, size }: BadgeStyleProps & { status: Status }) {
  return <Badge {...CONFIG[status]} size={size} />;
}
