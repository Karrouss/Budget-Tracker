import { Component, Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { Router } from '@angular/router';
import { MonthlyCategory, PAYMENT_METHOD_LABELS, PaymentMethod, TransactionViewModel } from '../../../core/models';
import { MonthService } from '../../../core/services/month.service';
import { MonthlyCategoryService } from '../../../core/services/monthly-category.service';
import { ExpenseService } from '../../../core/services/expense.service';
import { DashboardRefreshService } from '../../../core/services/dashboard-refresh.service';
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
  readonly paymentMethodLabels = PAYMENT_METHOD_LABELS;
  loading = true;
  saving = false;
  error: string | null = null;

  constructor(
    private readonly modalCtrl: ModalController,
    private readonly router: Router,
    private readonly monthService: MonthService,
    private readonly monthlyCategoryService: MonthlyCategoryService,
    private readonly expenseService: ExpenseService,
    private readonly dashboardRefresh: DashboardRefreshService,
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
    if (this.amount === null || this.amount === 0) {
      this.error = 'Indiquez un montant différent de zéro.';
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
      if (this.expense) {
        await this.expenseService.update(this.expense.id, {
          monthlyCategoryId: this.monthlyCategoryId,
          amount: this.amount,
          note: this.note.trim(),
          paymentMethod: this.paymentMethod,
        });
        this.dashboardRefresh.notify();
        await this.modalCtrl.dismiss({ saved: true });
        return;
      }

      await this.expenseService.create({
        monthlyCategoryId: this.monthlyCategoryId,
        amount: this.amount,
        date: new Date().toISOString(),
        note: this.note.trim(),
        paymentMethod: this.paymentMethod,
      });
      this.dashboardRefresh.notify();
      await this.modalCtrl.dismiss({ saved: true });
      await this.router.navigateByUrl('/dashboard');
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
