import { Injectable } from '@angular/core';
import { Capacitor } from '@capacitor/core';
import { LocalNotifications } from '@capacitor/local-notifications';
import { SettingsService } from './settings.service';

const REMINDER_ID = 1001;

/** Daily local notification reminding the user to log their expenses (mobile app only). */
@Injectable({ providedIn: 'root' })
export class ReminderService {
  constructor(private readonly settingsService: SettingsService) {}

  get isSupported(): boolean {
    return Capacitor.isNativePlatform();
  }

  /** Re-applies the saved reminder at startup (keeps the schedule in sync with settings). */
  async syncFromSettings(): Promise<void> {
    if (!this.isSupported) return;
    const settings = await this.settingsService.get();
    if (settings.reminderEnabled) {
      const permission = await LocalNotifications.checkPermissions();
      if (permission.display === 'granted') {
        await this.schedule(settings.reminderTime);
      }
    } else {
      await this.cancel();
    }
  }

  /** Returns false if the user refused notifications. */
  async enable(time: string): Promise<boolean> {
    if (!this.isSupported) return false;
    let permission = await LocalNotifications.checkPermissions();
    if (permission.display !== 'granted') {
      permission = await LocalNotifications.requestPermissions();
    }
    if (permission.display !== 'granted') return false;
    await this.schedule(time);
    return true;
  }

  async cancel(): Promise<void> {
    if (!this.isSupported) return;
    await LocalNotifications.cancel({ notifications: [{ id: REMINDER_ID }] });
  }

  private async schedule(time: string): Promise<void> {
    const [hour, minute] = time.split(':').map(Number);
    await this.cancel();
    await LocalNotifications.schedule({
      notifications: [
        {
          id: REMINDER_ID,
          title: 'Budget Tracker',
          body: "Avez-vous noté vos dépenses aujourd'hui ?",
          schedule: { on: { hour, minute }, allowWhileIdle: true },
        },
      ],
    });
  }
}
