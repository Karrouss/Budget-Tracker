import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { StorageService } from './storage.service';

export type ThemeMode = 'light' | 'dark';

const STORAGE_KEY = 'theme';
const DARK_CLASS = 'ion-palette-dark';

/** User-controlled light/dark toggle (never follows the OS — see global.scss). */
@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly subject = new BehaviorSubject<ThemeMode>('light');
  readonly mode$ = this.subject.asObservable();

  constructor(private readonly storage: StorageService) {
    void this.init();
  }

  get value(): ThemeMode {
    return this.subject.value;
  }

  async toggle(): Promise<void> {
    const next: ThemeMode = this.subject.value === 'dark' ? 'light' : 'dark';
    this.apply(next);
    await this.storage.setItem(STORAGE_KEY, next);
  }

  private async init(): Promise<void> {
    const saved = await this.storage.getItem<ThemeMode>(STORAGE_KEY);
    if (saved === 'dark' || saved === 'light') {
      this.apply(saved);
    }
  }

  private apply(mode: ThemeMode): void {
    this.subject.next(mode);
    document.documentElement.classList.toggle(DARK_CLASS, mode === 'dark');
  }
}
