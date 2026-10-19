import { Injectable } from '@angular/core';
import { Capacitor } from '@capacitor/core';
import { Directory, Encoding, Filesystem } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';
import { StorageService } from './storage.service';
import { todayDayString } from '../utils/date.util';

const BACKUP_APP_ID = 'budget-tracker';
const BACKUP_VERSION = 1;
/** Every StorageService key holding user data. Collections must be arrays. */
const COLLECTION_KEYS = ['months', 'categories', 'monthlyCategories', 'expenses'] as const;
const OTHER_KEYS = ['settings', 'theme'] as const;

export interface BackupFile {
  app: typeof BACKUP_APP_ID;
  version: number;
  exportedAt: string;
  data: Record<string, unknown>;
}

export interface BackupSummary {
  exportedAt: string;
  expenses: number;
  categories: number;
}

/** Export / import of all local data as a JSON file, so it survives an uninstall. */
@Injectable({ providedIn: 'root' })
export class BackupService {
  constructor(private readonly storage: StorageService) {}

  async export(): Promise<void> {
    const data: Record<string, unknown> = {};
    for (const key of [...COLLECTION_KEYS, ...OTHER_KEYS]) {
      data[key] = await this.storage.getItem(key);
    }
    const backup: BackupFile = { app: BACKUP_APP_ID, version: BACKUP_VERSION, exportedAt: new Date().toISOString(), data };
    const fileName = `budget-tracker-${todayDayString()}.json`;
    const json = JSON.stringify(backup, null, 2);

    if (Capacitor.isNativePlatform()) {
      // Downloads don't work inside the Android WebView: write a file and open the share sheet.
      const { uri } = await Filesystem.writeFile({ path: fileName, data: json, directory: Directory.Cache, encoding: Encoding.UTF8 });
      await Share.share({ title: 'Sauvegarde Budget Tracker', files: [uri], dialogTitle: 'Enregistrer la sauvegarde' });
      return;
    }

    const url = URL.createObjectURL(new Blob([json], { type: 'application/json' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    link.click();
    URL.revokeObjectURL(url);
  }

  /** Parses and validates a backup file; throws a user-facing message if it isn't one. */
  parse(text: string): { backup: BackupFile; summary: BackupSummary } {
    let parsed: unknown;
    try {
      parsed = JSON.parse(text);
    } catch {
      throw new Error("Ce fichier n'est pas une sauvegarde Budget Tracker valide.");
    }
    const backup = parsed as Partial<BackupFile>;
    if (backup?.app !== BACKUP_APP_ID || typeof backup.data !== 'object' || backup.data === null) {
      throw new Error("Ce fichier n'est pas une sauvegarde Budget Tracker valide.");
    }
    if ((backup.version ?? 0) > BACKUP_VERSION) {
      throw new Error("Cette sauvegarde provient d'une version plus récente de l'application.");
    }
    for (const key of COLLECTION_KEYS) {
      const value = backup.data[key];
      if (value !== null && value !== undefined && !Array.isArray(value)) {
        throw new Error('Cette sauvegarde est corrompue.');
      }
    }
    const count = (key: string) => ((backup.data![key] as unknown[] | null) ?? []).length;
    return {
      backup: backup as BackupFile,
      summary: { exportedAt: backup.exportedAt ?? '', expenses: count('expenses'), categories: count('categories') },
    };
  }

  /** Replaces all local data with the backup's content. */
  async restore(backup: BackupFile): Promise<void> {
    for (const key of [...COLLECTION_KEYS, ...OTHER_KEYS]) {
      const value = backup.data[key];
      if (value === null || value === undefined) {
        await this.storage.removeItem(key);
      } else {
        await this.storage.setItem(key, value);
      }
    }
  }
}
