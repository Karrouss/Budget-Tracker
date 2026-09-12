import { Component } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { ExpenseFormComponent } from '../shared/components/expense-form/expense-form.component';

@Component({
  selector: 'app-tabs',
  templateUrl: 'tabs.page.html',
  styleUrls: ['tabs.page.scss'],
  standalone: false,
})
export class TabsPage {
  constructor(private readonly modalCtrl: ModalController) {}

  async openAddExpense(): Promise<void> {
    const modal = await this.modalCtrl.create({ component: ExpenseFormComponent });
    await modal.present();
  }
}
