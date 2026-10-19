import { Component, Input, OnInit } from '@angular/core';
import { AlertController, ModalController } from '@ionic/angular';
import { Router } from '@angular/router';
import { MonthlyCategory, PAYMENT_METHOD_LABELS, PaymentMethod, TransactionViewModel } from '../../../core/models';
import { MonthService } from '../../../core/services/month.service';
import { MonthlyCategoryService } from '../../../core/services/monthly-category.service';
import { ExpenseService } from '../../../core/services/expense.service';
import { DashboardRefreshService } from '../../../core/services/dashboard-refresh.service';
import { BudgetAlertService } from '../../../core/services/budget-alert.service';
import { dayStringToIso, firstDayOfCurrentMonthString, toDayString, todayDayString } from '../../../core/utils/date.util';
import { CategoryFormComponent } from '../category-form/category-form.component';

@Component({
  selector: 'app-expense-form',
  templateUrl: './expense-form.component.html',
  styleUrls: ['./expense-form.component.scss'],
  standalone: false,
})
export class ExpenseFormComponent implements OnInit {
  /** When set, the form edits this expense instead of creating a new one. */
  @Input() expense?: TransactionViewModel;

  categories: MonthlyCategory[] = [];
  monthlyCategoryId: string | null = null;
  amount: number | null = null;
  note = '';
  paymentMethod: PaymentMethod | null = null;
  /** YYYY-MM-DD, limited to the current month up to today. */
  day = todayDayString();
  readonly minDay = firstDayOfCurrentMonthString();
  readonly maxDay = todayDayString();
  readonly paymentMethodLabels = PAYMENT_METHOD_LABELS;
  loading = true;
  saving = false;
  error: string | null = null;

  constructor(
    private readonly modalCtrl: ModalController,
    private readonly alertCtrl: AlertController,
    private readonly router: Router,
    private readonly monthService: MonthService,
    private readonly monthlyCategoryService: MonthlyCategoryService,
    private readonly expenseService: ExpenseService,
    private readonly dashboardRefresh: DashboardRefreshService,
    private readonly budgetAlerts: BudgetAlertService,
  ) {}

  get isEdit(): boolean {
    return !!this.expense;
  }

  async ngOnInit(): Promise<void> {
    const month = await this.monthService.getCurrentMonth();
    this.categories = await this.monthlyCategoryService.listVisibleForMonth(month.id);

    if (this.expense) {
      const expense = this.expense;
      // Keep the expense's own category selectable even if it has since been deleted.
      if (!this.categories.some((c) => c.id === expense.monthlyCategoryId)) {
        const all = await this.monthlyCategoryService.listForMonth(month.id);
        const own = all.find((c) => c.id === expense.monthlyCategoryId);
        if (own) this.categories = [own, ...this.categories];
      }
      this.monthlyCategoryId = expense.monthlyCategoryId;
      this.amount = expense.amount;
      this.note = expense.note ?? '';
      this.paymentMethod = expense.paymentMethod;
      this.day = toDayString(new Date(expense.date));
    } else {
      this.monthlyCategoryId = this.categories[0]?.id ?? null;
    }
    this.loading = false;
  }

  async save(): Promise<void> {
    if (!this.monthlyCategoryId) {
      this.error = 'Choisissez une catégorie.';
      return;
    }
    if (this.amount === null || !(this.amount > 0)) {
      this.error = 'Indiquez un montant supérieur à zéro.';
      return;
    }
    if (!this.day || this.day < this.minDay || this.day > this.maxDay) {
      this.error = 'Choisissez une date comprise dans le mois en cours, au plus tard aujourd’hui.';
      return;
    }
    if (!this.paymentMethod) {
      this.error = 'Indiquez si la dépense a été payée en cash ou par CB.';
      return;
    }
    if (!this.note.trim()) {
      this.error = 'Une note est obligatoire (ex : ce que vous avez acheté).';
      return;
    }

    this.error = null;
    this.saving = true;
    try {
      const affected = [this.monthlyCategoryId, ...(this.expense ? [this.expense.monthlyCategoryId] : [])];
      const before = await this.budgetAlerts.snapshot(affected);

      if (this.expense) {
        const dayChanged = this.day !== toDayString(new Date(this.expense.date));
        await this.expenseService.update(this.expense.id, {
          monthlyCategoryId: this.monthlyCategoryId,
          amount: this.amount,
          note: this.note.trim(),
          paymentMethod: this.paymentMethod,
          // Keep the original timestamp unless the day itself was changed.
          ...(dayChanged ? { date: dayStringToIso(this.day) } : {}),
        });
      } else {
        await this.expenseService.create({
          monthlyCategoryId: this.monthlyCategoryId,
          amount: this.amount,
          date: dayStringToIso(this.day),
          note: this.note.trim(),
          paymentMethod: this.paymentMethod,
        });
      }

      this.dashboardRefresh.notify();
      await this.budgetAlerts.notifyCrossings(before);
      await this.modalCtrl.dismiss({ saved: true });
      if (!this.expense) {
        await this.router.navigateByUrl('/dashboard');
      }
    } finally {
      this.saving = false;
    }
  }

  async confirmDelete(): Promise<void> {
    if (!this.expense) return;
    const expense = this.expense;
    const alert = await this.alertCtrl.create({
      header: 'Supprimer cette dépense ?',
      message: 'Cette action est définitive.',
      buttons: [
        { text: 'Annuler', role: 'cancel' },
        {
          text: 'Supprimer',
          role: 'destructive',
          handler: () => {
            void this.delete(expense.id);
          },
        },
      ],
    });
    await alert.present();
  }

  private async delete(id: string): Promise<void> {
    this.saving = true;
    try {
      await this.expenseService.delete(id);
      this.dashboardRefresh.notify();
      await this.modalCtrl.dismiss({ deleted: true });
    } finally {
      this.saving = false;
    }
  }

  async createCategoryInstead(): Promise<void> {
    await this.modalCtrl.dismiss(null);
    const modal = await this.modalCtrl.create({ component: CategoryFormComponent });
    await modal.present();
  }

  cancel(): void {
    void this.modalCtrl.dismiss(null);
  }
}
