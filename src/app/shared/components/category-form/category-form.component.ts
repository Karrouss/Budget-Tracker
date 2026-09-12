import { Component, Input, OnInit } from '@angular/core';
import { AlertController, ModalController } from '@ionic/angular';
import { CategoryCardViewModel } from '../../../core/models';
import { CategoryService } from '../../../core/services/category.service';
import { MonthlyCategoryService } from '../../../core/services/monthly-category.service';
import { ExpenseService } from '../../../core/services/expense.service';
import { DashboardRefreshService } from '../../../core/services/dashboard-refresh.service';
import { DEFAULT_CATEGORY_COLOR, DEFAULT_CATEGORY_ICON } from '../../../core/utils/category-presets';

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
  expenseError: string | null = null;
  expenseSaving = false;

  get isEditing(): boolean {
    return this.category !== null;
  }

  constructor(
    private readonly modalCtrl: ModalController,
    private readonly alertCtrl: AlertController,
    private readonly categoryService: CategoryService,
    private readonly monthlyCategoryService: MonthlyCategoryService,
    private readonly expenseService: ExpenseService,
    private readonly dashboardRefresh: DashboardRefreshService,
  ) {}

  ngOnInit(): void {
    if (this.category) {
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

  /** Logs a spend adjustment for this month. Amount can be negative to correct a past entry. */
  async addExpense(): Promise<void> {
    if (!this.category) return;

    if (this.expenseAmount === null || this.expenseAmount === 0) {
      this.expenseError = 'Indiquez un montant différent de zéro (négatif pour corriger une erreur).';
      return;
    }
    if (!this.expenseNote.trim()) {
      this.expenseError = 'Une note est obligatoire (ex : raison de la correction).';
      return;
    }

    this.expenseError = null;
    this.expenseSaving = true;
    try {
      await this.expenseService.create({
        monthlyCategoryId: this.category.monthlyCategoryId,
        amount: this.expenseAmount,
        date: new Date().toISOString(),
        note: this.expenseNote.trim(),
      });
      this.dashboardRefresh.notify();
      await this.modalCtrl.dismiss({ saved: true });
    } finally {
      this.expenseSaving = false;
    }
  }

  async deleteCategory(): Promise<void> {
    if (!this.category) return;

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
