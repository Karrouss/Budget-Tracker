import { Injectable } from '@angular/core';
import { MonthService } from './month.service';
import { MonthlyCategoryService } from './monthly-category.service';
import { ExpenseService } from './expense.service';
import { CategoryCardViewModel, DashboardSummary, Month } from '../models';
import { formatMonthLabel } from '../utils/month-key.util';
import {
  gaugePercentage,
  gaugeState,
  overspendAmount,
  percentageUsed,
  remaining,
  sum,
} from '../utils/budget-calculations';

@Injectable({ providedIn: 'root' })
export class DashboardService {
  constructor(
    private readonly monthService: MonthService,
    private readonly monthlyCategoryService: MonthlyCategoryService,
    private readonly expenseService: ExpenseService,
  ) {}

  async getCurrentDashboard(): Promise<DashboardSummary> {
    const month = await this.monthService.getCurrentMonth();
    return this.buildSummary(month);
  }

  /** Falls back to the current month if `monthKey` hasn't been created yet. */
  async getDashboardForMonth(monthKey: string): Promise<DashboardSummary> {
    const month = (await this.monthService.getByMonthKey(monthKey)) ?? (await this.monthService.getCurrentMonth());
    return this.buildSummary(month);
  }

  private async buildSummary(month: Month): Promise<DashboardSummary> {
    const monthlyCategories = await this.monthlyCategoryService.listVisibleForMonth(month.id);
    const expenses = await this.expenseService.listForMonthlyCategories(
      monthlyCategories.map((mc) => mc.id),
    );

    const categories: CategoryCardViewModel[] = monthlyCategories
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map((mc) => {
        const spent = sum(
          expenses.filter((e) => e.monthlyCategoryId === mc.id).map((e) => e.amount),
        );
        return {
          monthlyCategoryId: mc.id,
          categoryId: mc.categoryId,
          name: mc.name,
          icon: mc.icon,
          color: mc.color,
          budget: mc.budget,
          spent,
          remaining: remaining(spent, mc.budget),
          percentage: percentageUsed(spent, mc.budget),
          gaugePercentage: gaugePercentage(spent, mc.budget),
          gaugeState: gaugeState(spent, mc.budget),
          overspend: overspendAmount(spent, mc.budget),
        };
      });

    const totalBudget = sum(categories.map((c) => c.budget));
    const totalSpent = sum(categories.map((c) => c.spent));

    return {
      monthKey: month.monthKey,
      monthLabel: formatMonthLabel(month.monthKey),
      totalBudget,
      totalSpent,
      totalRemaining: remaining(totalSpent, totalBudget),
      percentage: percentageUsed(totalSpent, totalBudget),
      categories,
    };
  }
}
