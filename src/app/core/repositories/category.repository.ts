import { Injectable } from '@angular/core';
import { StorageService } from '../services/storage.service';
import { CollectionRepository } from './collection.repository';
import { Category } from '../models';

@Injectable({ providedIn: 'root' })
export class CategoryRepository extends CollectionRepository<Category> {
  constructor(storage: StorageService) {
    super(storage, 'categories');
  }
}
