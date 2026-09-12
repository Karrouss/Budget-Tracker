/** Builds a monthKey in the YYYY-MM format used to identify a Month. */
export function toMonthKey(year: number, month: number): string {
  return `${year}-${String(month).padStart(2, '0')}`;
}

export function monthKeyForDate(date: Date): string {
  return toMonthKey(date.getFullYear(), date.getMonth() + 1);
}

export function currentMonthKey(): string {
  return monthKeyForDate(new Date());
}

export function parseMonthKey(monthKey: string): { year: number; month: number } {
  const [year, month] = monthKey.split('-').map(Number);
  return { year, month };
}

export function nextMonthKey(monthKey: string): string {
  const { year, month } = parseMonthKey(monthKey);
  return month === 12 ? toMonthKey(year + 1, 1) : toMonthKey(year, month + 1);
}

export function previousMonthKey(monthKey: string): string {
  const { year, month } = parseMonthKey(monthKey);
  return month === 1 ? toMonthKey(year - 1, 12) : toMonthKey(year, month - 1);
}

/** All monthKeys strictly between two keys, in chronological order (used to backfill gaps). */
export function monthKeysBetween(fromExclusive: string, toExclusive: string): string[] {
  const keys: string[] = [];
  let cursor = nextMonthKey(fromExclusive);
  while (cursor !== toExclusive) {
    keys.push(cursor);
    cursor = nextMonthKey(cursor);
  }
  return keys;
}

const MONTH_NAMES_FR = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre',
];

export function formatMonthLabel(monthKey: string): string {
  const { year, month } = parseMonthKey(monthKey);
  return `${MONTH_NAMES_FR[month - 1]} ${year}`;
}
