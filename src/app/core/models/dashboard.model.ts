import { GaugeState } from '../utils/budget-calculations';

export interface CategoryCardViewModel {
  monthlyCategoryId: string;
  categoryId: string;
  name: string;
  icon: string | null;
  color: string | null;
  budget: number;
  spent: number;
  remaining: number;
  percentage: number;
  gaugePercentage: number;
  gaugeState: GaugeState;
  overspend: number;
}

export interface DashboardSummary {
  monthKey: string;
  monthLabel: string;
  totalBudget: number;
  totalSpent: number;
  totalRemaining: number;
  percentage: number;
  categories: CategoryCardViewModel[];
}
