export const DEMO_CURRENCY = 'USD';
export const DEMO_LOCALE = 'en-US';
// Use the viewer's local time zone consistently, including historical demo records.
const currency = new Intl.NumberFormat(DEMO_LOCALE, { style: 'currency', currency: DEMO_CURRENCY });
const date = new Intl.DateTimeFormat(DEMO_LOCALE, {
  year: 'numeric',
  month: 'short',
  day: 'numeric',
});
const time = new Intl.DateTimeFormat(DEMO_LOCALE, { hour: '2-digit', minute: '2-digit' });
const dateTime = new Intl.DateTimeFormat(DEMO_LOCALE, {
  year: 'numeric',
  month: 'short',
  day: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
});
export function formatCurrency(amount: number | undefined): string {
  return typeof amount === 'number' && Number.isFinite(amount) ? currency.format(amount) : '—';
}
function formatTimestamp(value: string, formatter: Intl.DateTimeFormat): string {
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? '—' : formatter.format(parsed);
}
export function formatDate(value: string): string {
  return formatTimestamp(value, date);
}
export function formatTime(value: string): string {
  return formatTimestamp(value, time);
}
export function formatDateTime(value: string): string {
  return formatTimestamp(value, dateTime);
}
