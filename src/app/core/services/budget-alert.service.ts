import { Injectable } from '@angular/core';
import { ToastController } from '@ionic/angular';
import { MonthlyCategoryRepository } from '../repositories/monthly-category.repository';
import { ExpenseService } from './expense.service';
import { SettingsService } from './settings.service';
import { percentageUsed, sum } from '../utils/budget-calculations';
import { formatCurrency } from '../utils/currency.util';

const WARNING_THRESHOLD = 80;
const EXCEEDED_THRESHOLD = 100;

export type SpentSnapshot = Map<string, number>;

/**
 * Warns the user, right after saving an expense, when a category crosses 80% or
 * 100% of its budget. Usage: take a snapshot before the change, then call
 * `notifyCrossings` with it once the change is saved.
 */
@Injectable({ providedIn: 'root' })
export class BudgetAlertService {
  constructor(
    private readonly monthlyCategoryRepo: MonthlyCategoryRepository,
    private readonly expenseService: ExpenseService,
    private readonly settingsService: SettingsService,
    private readonly toastCtrl: ToastController,
  ) {}

  async snapshot(monthlyCategoryIds: string[]): Promise<SpentSnapshot> {
    const ids = [...new Set(monthlyCategoryIds)];
    const expenses = await this.expenseService.listForMonthlyCategories(ids);
    return new Map(
      ids.map((id) => [id, sum(expenses.filter((e) => e.monthlyCategoryId === id).map((e) => e.amount))]),
    );
  }

  async notifyCrossings(before: SpentSnapshot): Promise<void> {
    const settings = await this.settingsService.get();
    if (!settings.budgetAlertsEnabled) return;

    const after = await this.snapshot([...before.keys()]);
    for (const [id, spentAfter] of after) {
      const category = await this.monthlyCategoryRepo.findById(id);
      if (!category || category.budget <= 0) continue;

      const pctBefore = percentageUsed(before.get(id) ?? 0, category.budget);
      const pctAfter = percentageUsed(spentAfter, category.budget);
      const amounts = `${formatCurrency(spentAfter)} / ${formatCurrency(category.budget)}`;

      if (pctAfter > EXCEEDED_THRESHOLD && pctBefore <= EXCEEDED_THRESHOLD) {
        await this.show(`Budget « ${category.name} » dépassé (${amounts})`, 'danger', 'alert-circle');
      } else if (pctAfter >= WARNING_THRESHOLD && pctBefore < WARNING_THRESHOLD && pctAfter <= EXCEEDED_THRESHOLD) {
        await this.show(`${Math.floor(pctAfter)} % du budget « ${category.name} » atteint (${amounts})`, 'warning', 'warning');
      }
    }
  }

  private async show(message: string, color: 'warning' | 'danger', icon: string): Promise<void> {
    const toast = await this.toastCtrl.create({ message, color, icon, duration: 4000, position: 'top' });
    await toast.present();
  }
}
