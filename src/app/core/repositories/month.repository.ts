import { Injectable } from '@angular/core';
import { StorageService } from '../services/storage.service';
import { CollectionRepository } from './collection.repository';
import { Month } from '../models';

@Injectable({ providedIn: 'root' })
export class MonthRepository extends CollectionRepository<Month> {
  constructor(storage: StorageService) {
    super(storage, 'months');
  }

  async findByMonthKey(monthKey: string): Promise<Month | null> {
    const months = await this.findAll();
    return months.find((m) => m.monthKey === monthKey) ?? null;
  }
}
