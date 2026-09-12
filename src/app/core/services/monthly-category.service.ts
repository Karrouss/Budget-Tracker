import { Injectable } from '@angular/core';
import { MonthlyCategoryRepository } from '../repositories/monthly-category.repository';
import { generateId } from '../repositories/collection.repository';
import { Category, MonthlyCategory } from '../models';

@Injectable({ providedIn: 'root' })
export class MonthlyCategoryService {
  constructor(private readonly repo: MonthlyCategoryRepository) {}

  async listForMonth(monthId: string): Promise<MonthlyCategory[]> {
    return this.repo.findByMonthId(monthId);
  }

  async listVisibleForMonth(monthId: string): Promise<MonthlyCategory[]> {
    const all = await this.repo.findByMonthId(monthId);
    return all.filter((mc) => mc.isVisible);
  }

  /** Attaches a newly created global Category to a month with an initial budget. */
  async addToMonth(monthId: string, category: Category, budget: number): Promise<MonthlyCategory> {
    const existing = await this.repo.findByMonthId(monthId);
    const monthlyCategory: MonthlyCategory = {
      id: generateId(),
      monthId,
      categoryId: category.id,
      name: category.name,
      icon: category.icon,
      color: category.color,
      budget,
      isVisible: true,
      sortOrder: existing.length,
    };
    await this.repo.insert(monthlyCategory);
    return monthlyCategory;
  }

  /** Budget changes only ever apply to the current month's snapshot — past months stay untouched (PRD §9.3). */
  async updateBudget(monthlyCategoryId: string, budget: number): Promise<void> {
    await this.repo.update(monthlyCategoryId, { budget });
  }

  async updateName(monthlyCategoryId: string, name: string): Promise<void> {
    await this.repo.update(monthlyCategoryId, { name });
  }

  async updateIcon(monthlyCategoryId: string, icon: string | null): Promise<void> {
    await this.repo.update(monthlyCategoryId, { icon });
  }

  async updateColor(monthlyCategoryId: string, color: string | null): Promise<void> {
    await this.repo.update(monthlyCategoryId, { color });
  }

  /**
   * Patches several fields in one write. Calling updateName/updateIcon/updateColor/updateBudget
   * concurrently (e.g. via Promise.all) is unsafe: each does its own read-modify-write of the
   * same underlying array, so whichever call's save() lands last silently discards the others.
   */
  async updateDetails(
    monthlyCategoryId: string,
    patch: Partial<Pick<MonthlyCategory, 'name' | 'icon' | 'color' | 'budget'>>,
  ): Promise<void> {
    await this.repo.update(monthlyCategoryId, patch);
  }

  async setVisibility(monthlyCategoryId: string, isVisible: boolean): Promise<void> {
    await this.repo.update(monthlyCategoryId, { isVisible });
  }

  async reorder(monthId: string, orderedIds: string[]): Promise<void> {
    await Promise.all(
      orderedIds.map((id, index) => this.repo.update(id, { sortOrder: index })),
    );
  }
}
