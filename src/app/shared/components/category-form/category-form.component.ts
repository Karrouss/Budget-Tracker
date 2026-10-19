import { Component, Input, OnInit } from '@angular/core';
import { AlertController, ModalController } from '@ionic/angular';
import { Router } from '@angular/router';
import { CategoryCardViewModel, PAYMENT_METHOD_LABELS, PaymentMethod } from '../../../core/models';
import { CategoryService } from '../../../core/services/category.service';
import { MonthlyCategoryService } from '../../../core/services/monthly-category.service';
import { ExpenseService } from '../../../core/services/expense.service';
import { DashboardRefreshService } from '../../../core/services/dashboard-refresh.service';
import { DEFAULT_CATEGORY_COLOR, DEFAULT_CATEGORY_ICON } from '../../../core/utils/category-presets';
import { MonthService } from '../../../core/services/month.service';
import { BudgetAlertService } from '../../../core/services/budget-alert.service';
import { MonthlyCategoryRepository } from '../../../core/repositories/monthly-category.repository';
import { dayStringToIso, firstDayOfCurrentMonthString, todayDayString } from '../../../core/utils/date.util';

@Component({
  selector: 'app-category-form',
  templateUrl: './category-form.component.html',
  styleUrls: ['./category-form.component.scss'],
  standalone: false,
})
export class CategoryFormComponent implements OnInit {
  /** Pass an existing card to edit it; leave null to create a new category. */
  @Input() category: CategoryCardViewModel | null = null;

  name = '';
  budget: number | null = null;
  icon = DEFAULT_CATEGORY_ICON;
  color = DEFAULT_CATEGORY_COLOR;
  saving = false;
  error: string | null = null;

  expenseAmount: number | null = null;
  expenseNote = '';
  expensePaymentMethod: PaymentMethod | null = null;
  expenseDay = todayDayString();
  readonly minDay = firstDayOfCurrentMonthString();
  readonly maxDay = todayDayString();
  /** Expenses can only be added to the current month's categories. */
  isCurrentMonth = false;
  readonly paymentMethodLabels = PAYMENT_METHOD_LABELS;
  expenseError: string | null = null;
  expenseSaving = false;

  get isEditing(): boolean {
    return this.category !== null;
  }

  constructor(
    private readonly modalCtrl: ModalController,
    private readonly alertCtrl: AlertController,
    private readonly router: Router,
    private readonly categoryService: CategoryService,
    private readonly monthlyCategoryService: MonthlyCategoryService,
    private readonly expenseService: ExpenseService,
    private readonly dashboardRefresh: DashboardRefreshService,
    private readonly monthService: MonthService,
    private readonly monthlyCategoryRepo: MonthlyCategoryRepository,
    private readonly budgetAlerts: BudgetAlertService,
  ) {}

  async ngOnInit(): Promise<void> {
    if (this.category) {
      const [currentMonth, monthlyCategory] = await Promise.all([
        this.monthService.getCurrentMonth(),
        this.monthlyCategoryRepo.findById(this.category.monthlyCategoryId),
      ]);
      this.isCurrentMonth = monthlyCategory?.monthId === currentMonth.id;
      this.name = this.category.name;
      this.budget = this.category.budget;
      this.icon = this.category.icon ?? DEFAULT_CATEGORY_ICON;
      this.color = this.category.color ?? DEFAULT_CATEGORY_COLOR;
    }
  }

  async save(): Promise<void> {
    const trimmedName = this.name.trim();
    if (!trimmedName) {
      this.error = 'Le nom de la catégorie est obligatoire.';
      return;
    }
    if (this.budget === null || this.budget < 0) {
      this.error = 'Le budget doit être un nombre positif.';
      return;
    }

    this.error = null;
    this.saving = true;
    try {
      if (this.category) {
        await this.categoryService.update(this.category.categoryId, {
          name: trimmedName,
          icon: this.icon,
          color: this.color,
        });
        await this.monthlyCategoryService.updateDetails(this.category.monthlyCategoryId, {
          name: trimmedName,
          icon: this.icon,
          color: this.color,
          budget: this.budget,
        });
      } else {
        await this.categoryService.create({
          name: trimmedName,
          icon: this.icon,
          color: this.color,
          budget: this.budget,
        });
      }

      this.dashboardRefresh.notify();
      await this.modalCtrl.dismiss({ saved: true });
    } finally {
      this.saving = false;
    }
  }

  /** Logs an expense in this category for the current month. */
  async addExpense(): Promise<void> {
    if (!this.category) return;

    if (this.expenseAmount === null || !(this.expenseAmount > 0)) {
      this.expenseError = 'Indiquez un montant supérieur à zéro.';
      return;
    }
    if (!this.expenseDay || this.expenseDay < this.minDay || this.expenseDay > this.maxDay) {
      this.expenseError = 'Choisissez une date comprise dans le mois en cours, au plus tard aujourd’hui.';
      return;
    }
    if (!this.expensePaymentMethod) {
      this.expenseError = 'Indiquez si la dépense a été payée en cash ou par CB.';
      return;
    }
    if (!this.expenseNote.trim()) {
      this.expenseError = 'Une note est obligatoire (ex : ce que vous avez acheté).';
      return;
    }

    this.expenseError = null;
    this.expenseSaving = true;
    try {
      const before = await this.budgetAlerts.snapshot([this.category.monthlyCategoryId]);
      await this.expenseService.create({
        monthlyCategoryId: this.category.monthlyCategoryId,
        amount: this.expenseAmount,
        date: dayStringToIso(this.expenseDay),
        note: this.expenseNote.trim(),
        paymentMethod: this.expensePaymentMethod,
      });
      this.dashboardRefresh.notify();
      await this.budgetAlerts.notifyCrossings(before);
      await this.modalCtrl.dismiss({ saved: true });
    } finally {
      this.expenseSaving = false;
    }
  }

  async deleteCategory(): Promise<void> {
    if (!this.category) return;

    // A category can only be deleted once its expenses have been moved to another category.
    const linkedExpenses = await this.expenseService.listForMonthlyCategories([this.category.monthlyCategoryId]);
    if (linkedExpenses.length > 0) {
      await this.showDeleteBlocked(linkedExpenses.length);
      return;
    }

    const alert = await this.alertCtrl.create({
      header: 'Supprimer cette catégorie ?',
      message:
        "Elle disparaîtra du mois en cours. L'historique des mois précédents et vos dépenses passées sont conservés.",
      buttons: [
        { text: 'Annuler', role: 'cancel' },
        {
          text: 'Supprimer',
          role: 'destructive',
          handler: () => this.confirmDelete(),
        },
      ],
    });
    await alert.present();
  }

  private async showDeleteBlocked(expenseCount: number): Promise<void> {
    const plural = expenseCount > 1;
    const alert = await this.alertCtrl.create({
      header: 'Suppression impossible',
      message:
        `Cette catégorie contient ${expenseCount} dépense${plural ? 's' : ''}. ` +
        `Modifiez la catégorie de ${plural ? 'ces dépenses' : 'cette dépense'} depuis l'onglet Transactions, ` +
        'puis supprimez la catégorie.',
      buttons: [
        { text: 'Fermer', role: 'cancel' },
        {
          text: 'Voir les transactions',
          handler: () => this.goToTransactions(),
        },
      ],
    });
    await alert.present();
  }

  private async goToTransactions(): Promise<void> {
    await this.modalCtrl.dismiss(null);
    await this.router.navigateByUrl('/transactions');
  }

  private async confirmDelete(): Promise<void> {
    if (!this.category) return;
    await this.categoryService.deactivate(this.category.categoryId);
    await this.monthlyCategoryService.setVisibility(this.category.monthlyCategoryId, false);
    this.dashboardRefresh.notify();
    await this.modalCtrl.dismiss({ deleted: true });
  }

  cancel(): void {
    void this.modalCtrl.dismiss(null);
  }
}
