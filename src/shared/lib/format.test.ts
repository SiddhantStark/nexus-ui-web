import { describe, expect, it } from 'vitest';
import { formatCurrency, formatDate, formatDateTime, formatTime } from './format';
import { lineTotal, sumMoney, toCents } from './money';

describe('demo formatting and cents arithmetic', () => {
  it('uses USD and consistent grouping, sign, and decimal places', () => {
    expect(formatCurrency(1299)).toBe('$1,299.00');
    expect(formatCurrency(-0.5)).toBe('-$0.50');
    expect(formatCurrency(0)).toBe('$0.00');
    expect(formatCurrency(NaN)).toBe('—');
  });
  it('formats dates consistently in the local time zone and handles invalid values', () => {
    const local = new Date(2026, 8, 23, 14, 5).toISOString();
    expect(formatDate(local)).toBe('Sep 23, 2026');
    expect(formatTime(local)).toBe('02:05 PM');
    expect(formatDateTime(local)).toContain('Sep 23, 2026');
    expect(formatDate('invalid')).toBe('—');
  });
  it('rounds unit prices once and avoids floating point drift in line and basket totals', () => {
    expect(toCents(1.005)).toBe(101);
    expect(toCents(10.075)).toBe(1008);
    expect(toCents(1e-7)).toBe(0);
    expect(toCents(-1.005)).toBe(-101);
    expect(lineTotal(1.005, 3)).toBe(3.03);
    expect(sumMoney([0.1, 0.2])).toBe(0.3);
    expect(sumMoney([19.99, 19.99, -19.99])).toBe(19.99);
  });
});
