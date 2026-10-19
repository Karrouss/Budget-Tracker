const pad = (n: number): string => String(n).padStart(2, '0');

/** Local calendar day of a date, as YYYY-MM-DD (the format ion-datetime works with). */
export function toDayString(date: Date): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export function todayDayString(): string {
  return toDayString(new Date());
}

export function firstDayOfCurrentMonthString(): string {
  const now = new Date();
  return toDayString(new Date(now.getFullYear(), now.getMonth(), 1));
}

/**
 * ISO timestamp to store for an expense dated `day`. Today keeps the current time
 * so same-day entries stay in input order; other days are pinned to local noon.
 */
export function dayStringToIso(day: string): string {
  if (day === todayDayString()) {
    return new Date().toISOString();
  }
  const [year, month, dayOfMonth] = day.split('-').map(Number);
  return new Date(year, month - 1, dayOfMonth, 12).toISOString();
}
