import { StorageService } from '../services/storage.service';

/**
 * Generic CRUD over a named array-backed collection persisted through
 * StorageService. Concrete repositories (CategoryRepository, ExpenseRepository, …)
 * extend this instead of re-implementing load/save/find boilerplate.
 */
export abstract class CollectionRepository<T extends { id: string }> {
  protected constructor(
    private readonly storage: StorageService,
    private readonly collectionKey: string,
  ) {}

  protected async all(): Promise<T[]> {
    return (await this.storage.getItem<T[]>(this.collectionKey)) ?? [];
  }

  private async save(items: T[]): Promise<void> {
    await this.storage.setItem(this.collectionKey, items);
  }

  async findAll(): Promise<T[]> {
    return this.all();
  }

  async findById(id: string): Promise<T | null> {
    const items = await this.all();
    return items.find((item) => item.id === id) ?? null;
  }

  async insert(item: T): Promise<T> {
    const items = await this.all();
    items.push(item);
    await this.save(items);
    return item;
  }

  async update(id: string, patch: Partial<T>): Promise<T | null> {
    const items = await this.all();
    const index = items.findIndex((item) => item.id === id);
    if (index === -1) {
      return null;
    }
    items[index] = { ...items[index], ...patch };
    await this.save(items);
    return items[index];
  }

  async delete(id: string): Promise<void> {
    const items = await this.all();
    await this.save(items.filter((item) => item.id !== id));
  }

  async replaceAll(items: T[]): Promise<void> {
    await this.save(items);
  }
}

export function generateId(): string {
  return typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}
