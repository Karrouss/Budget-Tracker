import { Injectable } from '@angular/core';
import { MonthRepository } from '../repositories/month.repository';
import { MonthlyCategoryRepository } from '../repositories/monthly-category.repository';
import { generateId } from '../repositories/collection.repository';
import { Month } from '../models';
import { currentMonthKey, nextMonthKey, parseMonthKey } from '../utils/month-key.util';

/**
 * Owns "passage automatique au nouveau mois" (PRD §14/§15): a month is
 * never mutated once created, and a new month is bootstrapped by copying
 * the previous month's categories/budgets/visibility/order — never its
 * expenses. Any gap of unopened months is backfilled one month at a time
 * so history stays chronologically contiguous.
 */
@Injectable({ providedIn: 'root' })
export class MonthService {
  constructor(
    private readonly monthRepo: MonthRepository,
    private readonly monthlyCategoryRepo: MonthlyCategoryRepository,
  ) {}

  async getCurrentMonth(): Promise<Month> {
    return this.ensureMonthExists(currentMonthKey());
  }

  async listMonths(): Promise<Month[]> {
    const months = await this.monthRepo.findAll();
    return [...months].sort((a, b) => (a.monthKey < b.monthKey ? 1 : -1));
  }

  async getByMonthKey(monthKey: string): Promise<Month | null> {
    return this.monthRepo.findByMonthKey(monthKey);
  }

  private async ensureMonthExists(targetMonthKey: string): Promise<Month> {
    const existing = await this.monthRepo.findByMonthKey(targetMonthKey);
    if (existing) {
      return existing;
    }

    const allMonths = await this.monthRepo.findAll();
    const previous = allMonths
      .filter((m) => m.monthKey < targetMonthKey)
      .sort((a, b) => (a.monthKey < b.monthKey ? 1 : -1))[0] ?? null;

    if (!previous) {
      return this.createMonth(targetMonthKey, null);
    }

    let cursorKey = nextMonthKey(previous.monthKey);
    let cursorPrevious = previous;
    let created: Month;
    do {
      created = await this.createMonth(cursorKey, cursorPrevious);
      cursorPrevious = created;
      cursorKey = nextMonthKey(cursorKey);
    } while (created.monthKey !== targetMonthKey);

    return created;
  }

  private async createMonth(monthKey: string, previousMonth: Month | null): Promise<Month> {
    const { year, month } = parseMonthKey(monthKey);
    const newMonth: Month = {
      id: generateId(),
      monthKey,
      year,
      month,
      createdAt: new Date().toISOString(),
    };
    await this.monthRepo.insert(newMonth);

    if (previousMonth) {
      const previousCategories = await this.monthlyCategoryRepo.findByMonthId(previousMonth.id);
      for (const category of previousCategories) {
        await this.monthlyCategoryRepo.insert({
          id: generateId(),
          monthId: newMonth.id,
          categoryId: category.categoryId,
          name: category.name,
          icon: category.icon,
          color: category.color,
          budget: category.budget,
          isVisible: category.isVisible,
          sortOrder: category.sortOrder,
        });
      }
    }

    return newMonth;
  }
}
