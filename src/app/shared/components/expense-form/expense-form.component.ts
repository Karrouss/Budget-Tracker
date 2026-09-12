import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { Router } from '@angular/router';
import { MonthlyCategory } from '../../../core/models';
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
  categories: MonthlyCategory[] = [];
  monthlyCategoryId: string | null = null;
  amount: number | null = null;
  note = '';
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

  async ngOnInit(): Promise<void> {
    const month = await this.monthService.getCurrentMonth();
    this.categories = await this.monthlyCategoryService.listVisibleForMonth(month.id);
    this.monthlyCategoryId = this.categories[0]?.id ?? null;
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
    if (!this.note.trim()) {
      this.error = 'Une note est obligatoire (ex : ce que vous avez acheté).';
      return;
    }

    this.error = null;
    this.saving = true;
    try {
      await this.expenseService.create({
        monthlyCategoryId: this.monthlyCategoryId,
        amount: this.amount,
        date: new Date().toISOString(),
        note: this.note.trim(),
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
