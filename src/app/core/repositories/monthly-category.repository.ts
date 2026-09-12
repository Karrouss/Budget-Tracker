import { Injectable } from '@angular/core';
import { StorageService } from '../services/storage.service';
import { CollectionRepository } from './collection.repository';
import { MonthlyCategory } from '../models';

@Injectable({ providedIn: 'root' })
export class MonthlyCategoryRepository extends CollectionRepository<MonthlyCategory> {
  constructor(storage: StorageService) {
    super(storage, 'monthlyCategories');
  }

  async findByMonthId(monthId: string): Promise<MonthlyCategory[]> {
    const items = await this.findAll();
    return items
      .filter((mc) => mc.monthId === monthId)
      .sort((a, b) => a.sortOrder - b.sortOrder);
  }
}
