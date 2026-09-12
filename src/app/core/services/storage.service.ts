import { Injectable } from '@angular/core';

/**
 * Thin key-value persistence abstraction. Business logic and repositories
 * only ever talk to this interface, never to a concrete storage engine —
 * see PRD §6.2/§23. Today it is backed by localStorage (the "fallback web
 * pour développement"); a native build can later swap in a SQLite-backed
 * implementation behind the same API without touching any repository.
 */
@Injectable({ providedIn: 'root' })
export class StorageService {
  private readonly prefix = 'budget-tracker:';

  async getItem<T>(key: string): Promise<T | null> {
    const raw = localStorage.getItem(this.prefix + key);
    if (raw === null) {
      return null;
    }
    try {
      return JSON.parse(raw) as T;
    } catch {
      return null;
    }
  }

  async setItem<T>(key: string, value: T): Promise<void> {
    localStorage.setItem(this.prefix + key, JSON.stringify(value));
  }

  async removeItem(key: string): Promise<void> {
    localStorage.removeItem(this.prefix + key);
  }
}
