import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActionSheetController } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { TransactionHistoryService } from '../../core/services/transaction-history.service';
import { MonthService } from '../../core/services/month.service';
import { DashboardRefreshService } from '../../core/services/dashboard-refresh.service';
import { SelectedMonthService } from '../../core/services/selected-month.service';
import { MonthTransactionsGroup } from '../../core/models';

@Component({
  selector: 'app-transactions',
  templateUrl: 'transactions.page.html',
  styleUrls: ['transactions.page.scss'],
  standalone: false,
})
export class TransactionsPage implements OnInit, OnDestroy {
  group: MonthTransactionsGroup | null = null;
  loading = true;

  private monthKeys: string[] = [];
  private refreshSubscription?: Subscription;
  private monthSyncSubscription?: Subscription;

  constructor(
    private readonly historyService: TransactionHistoryService,
    private readonly monthService: MonthService,
    private readonly dashboardRefresh: DashboardRefreshService,
    private readonly selectedMonth: SelectedMonthService,
    private readonly actionSheetCtrl: ActionSheetController,
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
    this.loading = false;
    this.selectedMonth.select(this.group.monthKey);
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

  formatDate(iso: string): string {
    return new Date(iso).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  }
}
