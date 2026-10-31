// Display helpers for decimal money strings such as "660.00".
// Uses integer cents, so no floating-point rounding is involved.

export function toCents(value) {
  const [whole, fraction = ''] = String(value).split('.');
  return Number(whole) * 100 + Number(fraction.padEnd(2, '0'));
}

export function formatCents(cents) {
  return `${Math.floor(cents / 100)}.${String(cents % 100).padStart(2, '0')}`;
}

export function addMoney(a, b) {
  return formatCents(toCents(a) + toCents(b));
}
