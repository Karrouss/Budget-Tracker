export type GaugeState = 'normal' | 'warning' | 'reached' | 'exceeded';

/**
 * Percentage used, unbounded (can exceed 100). Returns 0 when budget is 0
 * to avoid division by zero on categories without a budget yet.
 */
export function percentageUsed(spent: number, budget: number): number {
  if (budget <= 0) {
    return 0;
  }
  return (spent / budget) * 100;
}

export function remaining(spent: number, budget: number): number {
  return budget - spent;
}

export function overspendAmount(spent: number, budget: number): number {
  return Math.max(0, spent - budget);
}

/** Percentage clamped to [0, 100], for rendering circular/linear gauges. */
export function gaugePercentage(spent: number, budget: number): number {
  return Math.min(100, Math.max(0, percentageUsed(spent, budget)));
}

export function gaugeState(spent: number, budget: number): GaugeState {
  const pct = percentageUsed(spent, budget);
  if (pct > 100) return 'exceeded';
  if (pct === 100) return 'reached';
  if (pct >= 80) return 'warning';
  return 'normal';
}

export function sum(values: number[]): number {
  return values.reduce((total, value) => total + value, 0);
}
