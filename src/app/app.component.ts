import { Component } from '@angular/core';
import { ReminderService } from './core/services/reminder.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  standalone: false,
})
export class AppComponent {
  constructor(reminderService: ReminderService) {
    void reminderService.syncFromSettings();
  }
}
