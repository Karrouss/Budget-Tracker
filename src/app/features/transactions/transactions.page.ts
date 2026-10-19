import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActionSheetController, ModalController } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { TransactionHistoryService } from '../../core/services/transaction-history.service';
import { MonthService } from '../../core/services/month.service';
import { DashboardRefreshService } from '../../core/services/dashboard-refresh.service';
import { SelectedMonthService } from '../../core/services/selected-month.service';
import { MonthTransactionsGroup, PAYMENT_METHOD_LABELS, PaymentMethod, TransactionViewModel } from '../../core/models';
import { sum } from '../../core/utils/budget-calculations';
import { ExpenseFormComponent } from '../../shared/components/expense-form/expense-form.component';

@Component({
  selector: 'app-transactions',
  templateUrl: 'transactions.page.html',
  styleUrls: ['transactions.page.scss'],
  standalone: false,
})
export class TransactionsPage implements OnInit, OnDestroy {
  group: MonthTransactionsGroup | null = null;
  loading = true;
  readonly paymentMethodLabels = PAYMENT_METHOD_LABELS;

  searchText = '';
  categoryFilter: string | null = null;
  paymentFilter: PaymentMethod | 'all' = 'all';

  private monthKeys: string[] = [];
  private refreshSubscription?: Subscription;
  private monthSyncSubscription?: Subscription;

  constructor(
    private readonly historyService: TransactionHistoryService,
    private readonly monthService: MonthService,
    private readonly dashboardRefresh: DashboardRefreshService,
    private readonly selectedMonth: SelectedMonthService,
    private readonly actionSheetCtrl: ActionSheetController,
    private readonly modalCtrl: ModalController,
  ) {}

  async ngOnInit(): Promise<void> {
    await this.load(this.selectedMonth.value);
    this.refreshSubscription = this.dashboardRefresh.changes$.subscribe(() =>
      this.load(this.group?.monthKey),
    );
    this.monthSyncSubscription = this.selectedMonth.monthKey$.subscribe((monthKey) => {
      if (this.group && monthKey !== this.group.monthKey) {
        this.load(monthKey);
      }
    });
  }

  ngOnDestroy(): void {
    this.refreshSubscription?.unsubscribe();
    this.monthSyncSubscription?.unsubscribe();
  }

  async load(monthKey?: string): Promise<void> {
    this.loading = true;

    const months = await this.monthService.listMonths();
    this.monthKeys = months.map((m) => m.monthKey).sort();

    this.group = await this.historyService.getForMonth(monthKey ?? this.selectedMonth.value);
    // Drop a category filter that doesn't exist in the newly loaded month.
    if (this.categoryFilter && !this.group.transactions.some((t) => t.monthlyCategoryId === this.categoryFilter)) {
      this.categoryFilter = null;
    }
    this.loading = false;
    this.selectedMonth.select(this.group.monthKey);
  }

  /** Categories that actually have expenses this month, for the category filter. */
  get categoryOptions(): { id: string; name: string }[] {
    const byId = new Map<string, string>();
    for (const t of this.group?.transactions ?? []) byId.set(t.monthlyCategoryId, t.categoryName);
    return [...byId].map(([id, name]) => ({ id, name })).sort((a, b) => a.name.localeCompare(b.name, 'fr'));
  }

  get hasActiveFilters(): boolean {
    return !!this.searchText.trim() || this.categoryFilter !== null || this.paymentFilter !== 'all';
  }

  get filteredTransactions(): TransactionViewModel[] {
    const query = normalize(this.searchText.trim());
    return (this.group?.transactions ?? []).filter(
      (t) =>
        (this.categoryFilter === null || t.monthlyCategoryId === this.categoryFilter) &&
        (this.paymentFilter === 'all' || t.paymentMethod === this.paymentFilter) &&
        (!query || normalize(`${t.note ?? ''} ${t.categoryName}`).includes(query)),
    );
  }

  get filteredTotal(): number {
    return sum(this.filteredTransactions.map((t) => t.amount));
  }

  get filteredCashTotal(): number {
    return sum(this.filteredTransactions.filter((t) => t.paymentMethod === 'cash').map((t) => t.amount));
  }

  resetFilters(): void {
    this.searchText = '';
    this.categoryFilter = null;
    this.paymentFilter = 'all';
  }

  get canGoToPreviousMonth(): boolean {
    if (!this.group) return false;
    return this.monthKeys.indexOf(this.group.monthKey) > 0;
  }

  get canGoToNextMonth(): boolean {
    if (!this.group) return false;
    return this.monthKeys.indexOf(this.group.monthKey) < this.monthKeys.length - 1;
  }

  async goToPreviousMonth(): Promise<void> {
    if (!this.group || !this.canGoToPreviousMonth) return;
    const index = this.monthKeys.indexOf(this.group.monthKey);
    await this.load(this.monthKeys[index - 1]);
  }

  async goToNextMonth(): Promise<void> {
    if (!this.group || !this.canGoToNextMonth) return;
    const index = this.monthKeys.indexOf(this.group.monthKey);
    await this.load(this.monthKeys[index + 1]);
  }

  async openMonthPicker(): Promise<void> {
    const months = await this.monthService.listMonths();
    const actionSheet = await this.actionSheetCtrl.create({
      header: 'Choisir un mois',
      buttons: [
        ...months.map((m) => ({
          text: m.monthKey,
          handler: () => this.load(m.monthKey),
        })),
        { text: 'Annuler', role: 'cancel' },
      ],
    });
    await actionSheet.present();
  }

  /** The form notifies DashboardRefreshService on save, which reloads every tab. */
  async openEdit(transaction: TransactionViewModel): Promise<void> {
    const modal = await this.modalCtrl.create({
      component: ExpenseFormComponent,
      componentProps: { expense: transaction },
    });
    await modal.present();
  }

  formatDate(iso: string): string {
    return new Date(iso).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  }
}

/** Lower-case, accent-insensitive form used for searching ("Café" matches "cafe"). */
function normalize(text: string): string {
  return text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
}
