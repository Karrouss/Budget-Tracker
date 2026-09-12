import { Injectable } from '@angular/core';
import { StorageService } from './storage.service';
import { DEFAULT_SETTINGS, Settings } from '../models';

const SETTINGS_KEY = 'settings';

@Injectable({ providedIn: 'root' })
export class SettingsService {
  constructor(private readonly storage: StorageService) {}

  async get(): Promise<Settings> {
    const stored = await this.storage.getItem<Settings>(SETTINGS_KEY);
    return stored ?? DEFAULT_SETTINGS;
  }

  async update(patch: Partial<Settings>): Promise<Settings> {
    const current = await this.get();
    const next = { ...current, ...patch };
    await this.storage.setItem(SETTINGS_KEY, next);
    return next;
  }
}
