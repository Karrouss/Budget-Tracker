import { Component, OnInit } from '@angular/core';
import { AlertController, ToastController } from '@ionic/angular';
import { Settings } from '../../core/models';
import { SettingsService } from '../../core/services/settings.service';
import { ThemeService } from '../../core/services/theme.service';
import { ReminderService } from '../../core/services/reminder.service';
import { BackupFile, BackupService } from '../../core/services/backup.service';

@Component({
  selector: 'app-more',
  templateUrl: 'more.page.html',
  styleUrls: ['more.page.scss'],
  standalone: false,
})
export class MorePage implements OnInit {
  settings: Settings | null = null;
  busy = false;
  reminderError: string | null = null;
  readonly reminderSupported: boolean;

  constructor(
    private readonly settingsService: SettingsService,
    private readonly themeService: ThemeService,
    private readonly reminderService: ReminderService,
    private readonly backupService: BackupService,
    private readonly alertCtrl: AlertController,
    private readonly toastCtrl: ToastController,
  ) {
    this.reminderSupported = reminderService.isSupported;
  }

  async ngOnInit(): Promise<void> {
    this.settings = await this.settingsService.get();
  }

  get darkMode(): boolean {
    return this.themeService.value === 'dark';
  }

  async setDarkMode(enabled: boolean): Promise<void> {
    await this.themeService.set(enabled ? 'dark' : 'light');
  }

  async setReminderEnabled(enabled: boolean): Promise<void> {
    if (!this.settings) return;
    this.reminderError = null;
    if (enabled) {
      const granted = await this.reminderService.enable(this.settings.reminderTime);
      if (!granted) {
        this.reminderError = 'Autorisez les notifications pour Budget Tracker dans les réglages du téléphone.';
        this.settings = await this.settingsService.update({ reminderEnabled: false });
        return;
      }
    } else {
      await this.reminderService.cancel();
    }
    this.settings = await this.settingsService.update({ reminderEnabled: enabled });
  }

  async setReminderTime(value: string | number | null | undefined): Promise<void> {
    if (!this.settings || typeof value !== 'string' || !/^\d{2}:\d{2}/.test(value)) return;
    const time = value.slice(0, 5);
    this.settings = await this.settingsService.update({ reminderTime: time });
    if (this.settings.reminderEnabled) {
      await this.reminderService.enable(time);
    }
  }

  async setBudgetAlerts(enabled: boolean): Promise<void> {
    this.settings = await this.settingsService.update({ budgetAlertsEnabled: enabled });
  }

  async exportData(): Promise<void> {
    this.busy = true;
    try {
      await this.backupService.export();
    } catch (err) {
      // Closing the share sheet without choosing a target rejects; that's not an error.
      if (!/cancel/i.test(String((err as Error)?.message ?? err))) {
        await this.toast("L'export a échoué. Réessayez.", 'danger');
      }
    } finally {
      this.busy = false;
    }
  }

  async onFileSelected(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    input.value = ''; // allow picking the same file again
    if (!file) return;

    let backup: BackupFile;
    let summary: { exportedAt: string; expenses: number; categories: number };
    try {
      ({ backup, summary } = this.backupService.parse(await file.text()));
    } catch (err) {
      await this.toast((err as Error).message, 'danger');
      return;
    }

    const date = summary.exportedAt ? new Date(summary.exportedAt).toLocaleDateString('fr-FR') : 'date inconnue';
    const alert = await this.alertCtrl.create({
      header: 'Remplacer vos données ?',
      message:
        `Sauvegarde du ${date} : ${summary.categories} catégorie(s), ${summary.expenses} dépense(s). ` +
        'Toutes les données actuelles de cet appareil seront remplacées.',
      buttons: [
        { text: 'Annuler', role: 'cancel' },
        { text: 'Remplacer', role: 'destructive', handler: () => void this.restore(backup) },
      ],
    });
    await alert.present();
  }

  private async restore(backup: BackupFile): Promise<void> {
    this.busy = true;
    await this.backupService.restore(backup);
    // Every service and page caches derived state: restart cleanly on the restored data.
    window.location.reload();
  }

  private async toast(message: string, color: 'success' | 'danger'): Promise<void> {
    const toast = await this.toastCtrl.create({ message, color, duration: 3000, position: 'top' });
    await toast.present();
  }
}
