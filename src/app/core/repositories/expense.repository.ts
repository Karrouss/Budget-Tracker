import { Injectable } from '@angular/core';
import { StorageService } from '../services/storage.service';
import { CollectionRepository } from './collection.repository';
import { Expense } from '../models';

@Injectable({ providedIn: 'root' })
export class ExpenseRepository extends CollectionRepository<Expense> {
  constructor(storage: StorageService) {
    super(storage, 'expenses');
  }

  async findByMonthlyCategoryIds(monthlyCategoryIds: string[]): Promise<Expense[]> {
    const ids = new Set(monthlyCategoryIds);
    const items = await this.findAll();
    return items.filter((e) => ids.has(e.monthlyCategoryId));
  }
}
