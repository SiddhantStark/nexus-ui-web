/** Demo amounts are USD major units at the UI boundary; arithmetic uses integer cents. */
export function toCents(amount: number): number {
  // Shift the decimal exponent before rounding (10.075 * 100 is otherwise 1007.499…).
  const [digits, exponent = '0'] = Math.abs(amount).toString().split('e');
  return Math.sign(amount) * Math.round(Number(`${digits}e${Number(exponent) + 2}`));
}
export function lineTotal(price: number, quantity: number): number {
  return (toCents(price) * quantity) / 100;
}
export function sumMoney(amounts: number[]): number {
  return amounts.reduce((total, amount) => total + toCents(amount), 0) / 100;
}
