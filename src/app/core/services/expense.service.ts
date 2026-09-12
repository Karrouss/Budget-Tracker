import { Injectable } from '@angular/core';
import { ExpenseRepository } from '../repositories/expense.repository';
import { generateId } from '../repositories/collection.repository';
import { Expense, ExpenseInput } from '../models';

@Injectable({ providedIn: 'root' })
export class ExpenseService {
  constructor(private readonly repo: ExpenseRepository) {}

  async listForMonthlyCategories(monthlyCategoryIds: string[]): Promise<Expense[]> {
    return this.repo.findByMonthlyCategoryIds(monthlyCategoryIds);
  }

  async create(input: ExpenseInput): Promise<Expense> {
    const now = new Date().toISOString();
    const expense: Expense = {
      id: generateId(),
      ...input,
      createdAt: now,
      updatedAt: now,
    };
    await this.repo.insert(expense);
    return expense;
  }

  async update(id: string, input: Partial<ExpenseInput>): Promise<void> {
    await this.repo.update(id, { ...input, updatedAt: new Date().toISOString() });
  }

  async delete(id: string): Promise<void> {
    await this.repo.delete(id);
  }
}
