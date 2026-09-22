export type BadgeTone =
  | 'warning'
  | 'positive'
  | 'negative'
  | 'neutral'
  | 'muted'
  | 'info'
  | 'violet'
  | 'cyan'
  | 'indigo';
export interface BadgeStyleProps {
  size?: 'sm' | 'md';
}
const COLORS: Record<BadgeTone, string> = {
  warning: 'bg-amber-50 text-amber-700',
  positive: 'bg-emerald-50 text-emerald-700',
  negative: 'bg-red-50 text-red-700',
  neutral: 'bg-slate-100 text-slate-700',
  muted: 'bg-slate-100 text-slate-600',
  info: 'bg-blue-50 text-blue-700',
  violet: 'bg-violet-50 text-violet-700',
  cyan: 'bg-cyan-50 text-cyan-700',
  indigo: 'bg-indigo-50 text-indigo-700',
};
const DOTS: Record<BadgeTone, string> = {
  warning: 'bg-amber-400',
  positive: 'bg-emerald-400',
  negative: 'bg-red-400',
  neutral: 'bg-slate-400',
  muted: 'bg-slate-400',
  info: 'bg-blue-400',
  violet: 'bg-violet-400',
  cyan: 'bg-cyan-400',
  indigo: 'bg-indigo-400',
};
export default function Badge({
  label,
  tone,
  size = 'sm',
}: BadgeStyleProps & { label: string; tone: BadgeTone }) {
  const padding = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm';
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-medium ${COLORS[tone]} ${padding}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${DOTS[tone]}`} />
      {label}
    </span>
  );
}
