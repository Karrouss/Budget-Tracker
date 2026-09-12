import { Injectable } from '@angular/core';
import { MonthService } from './month.service';
import { MonthlyCategoryService } from './monthly-category.service';
import { ExpenseService } from './expense.service';
import { Month, MonthTransactionsGroup, TransactionViewModel } from '../models';
import { formatMonthLabel } from '../utils/month-key.util';
import { sum } from '../utils/budget-calculations';

/** Builds the "history of my spending, for this month" view for the Transactions tab. */
@Injectable({ providedIn: 'root' })
export class TransactionHistoryService {
  constructor(
    private readonly monthService: MonthService,
    private readonly monthlyCategoryService: MonthlyCategoryService,
    private readonly expenseService: ExpenseService,
  ) {}

  /** Falls back to the current month if `monthKey` hasn't been created yet. */
  async getForMonth(monthKey: string): Promise<MonthTransactionsGroup> {
    const month = (await this.monthService.getByMonthKey(monthKey)) ?? (await this.monthService.getCurrentMonth());
    return this.buildGroup(month);
  }

  private async buildGroup(month: Month): Promise<MonthTransactionsGroup> {
    // listForMonth (not listVisibleForMonth): a deleted category's past expenses still belong in history.
    const monthlyCategories = await this.monthlyCategoryService.listForMonth(month.id);
    const categoryById = new Map(monthlyCategories.map((mc) => [mc.id, mc]));
    const expenses = await this.expenseService.listForMonthlyCategories(
      monthlyCategories.map((mc) => mc.id),
    );

    const transactions: TransactionViewModel[] = expenses
      .map((e) => {
        const mc = categoryById.get(e.monthlyCategoryId);
        return {
          id: e.id,
          date: e.date,
          amount: e.amount,
          note: e.note,
          categoryName: mc?.name ?? 'Catégorie supprimée',
          categoryIcon: mc?.icon ?? null,
          categoryColor: mc?.color ?? null,
        };
      })
      .sort((a, b) => b.date.localeCompare(a.date));

    return {
      monthKey: month.monthKey,
      monthLabel: formatMonthLabel(month.monthKey),
      total: sum(transactions.map((t) => t.amount)),
      transactions,
    };
  }
}
