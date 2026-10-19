import { Component } from '@angular/core';
import { ReminderService } from './core/services/reminder.service';
import { ThemeService } from './core/services/theme.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  standalone: false,
})
export class AppComponent {
  // ThemeService is injected here so the saved theme is applied on startup.
  constructor(reminderService: ReminderService, _themeService: ThemeService) {
    void reminderService.syncFromSettings();
  }
}
