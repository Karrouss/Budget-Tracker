import { Injectable } from '@angular/core';
import { CategoryRepository } from '../repositories/category.repository';
import { generateId } from '../repositories/collection.repository';
import { MonthService } from './month.service';
import { MonthlyCategoryService } from './monthly-category.service';
import { Category, CategoryInput } from '../models';

@Injectable({ providedIn: 'root' })
export class CategoryService {
  constructor(
    private readonly repo: CategoryRepository,
    private readonly monthService: MonthService,
    private readonly monthlyCategoryService: MonthlyCategoryService,
  ) {}

  async listActive(): Promise<Category[]> {
    const all = await this.repo.findAll();
    return all.filter((c) => c.isActive);
  }

  /** Creates the global Category and immediately snapshots it into the current month with its budget. */
  async create(input: CategoryInput & { budget: number }): Promise<Category> {
    const now = new Date().toISOString();
    const category: Category = {
      id: generateId(),
      name: input.name,
      icon: input.icon,
      color: input.color,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    };
    await this.repo.insert(category);

    const currentMonth = await this.monthService.getCurrentMonth();
    await this.monthlyCategoryService.addToMonth(currentMonth.id, category, input.budget);

    return category;
  }

  /** Patches the global Category's name/icon/color. Does not touch past months' snapshots. */
  async update(categoryId: string, patch: Partial<CategoryInput>): Promise<void> {
    await this.repo.update(categoryId, { ...patch, updatedAt: new Date().toISOString() });
  }

  /** Soft-delete: keeps the category and every historical MonthlyCategory/Expense intact (PRD §9.4). */
  async deactivate(categoryId: string): Promise<void> {
    await this.repo.update(categoryId, { isActive: false, updatedAt: new Date().toISOString() });
  }
}
