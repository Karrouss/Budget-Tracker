import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActionSheetController } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { DashboardService } from '../../core/services/dashboard.service';
import { MonthService } from '../../core/services/month.service';
import { DashboardRefreshService } from '../../core/services/dashboard-refresh.service';
import { SelectedMonthService } from '../../core/services/selected-month.service';
import { DashboardSummary } from '../../core/models';
import { fallbackColorForIndex } from '../../core/utils/category-presets';

export interface CategorySlice {
  name: string;
  icon: string | null;
  color: string;
  spent: number;
  share: number; // % of total spent this month
  dashArray: string;
  dashOffset: number;
}

const RADIUS = 70;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

@Component({
  selector: 'app-stats',
  templateUrl: 'stats.page.html',
  styleUrls: ['stats.page.scss'],
  standalone: false,
})
export class StatsPage implements OnInit, OnDestroy {
  summary: DashboardSummary | null = null;
  slices: CategorySlice[] = [];
  loading = true;
  readonly circumference = CIRCUMFERENCE;

  private monthKeys: string[] = [];
  private refreshSubscription?: Subscription;
  private monthSyncSubscription?: Subscription;

  constructor(
    private readonly dashboardService: DashboardService,
    private readonly monthService: MonthService,
    private readonly dashboardRefresh: DashboardRefreshService,
    private readonly selectedMonth: SelectedMonthService,
    private readonly actionSheetCtrl: ActionSheetController,
  ) {}

  async ngOnInit(): Promise<void> {
    await this.load(this.selectedMonth.value);
    this.refreshSubscription = this.dashboardRefresh.changes$.subscribe(() =>
      this.load(this.summary?.monthKey),
    );
    this.monthSyncSubscription = this.selectedMonth.monthKey$.subscribe((monthKey) => {
      if (this.summary && monthKey !== this.summary.monthKey) {
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

    this.summary = monthKey
      ? await this.dashboardService.getDashboardForMonth(monthKey)
      : await this.dashboardService.getCurrentDashboard();
    this.slices = this.buildSlices(this.summary);
    this.loading = false;
    this.selectedMonth.select(this.summary.monthKey);
  }

  private buildSlices(summary: DashboardSummary): CategorySlice[] {
    const spending = summary.categories
      .map((c, index) => ({ ...c, color: c.color || fallbackColorForIndex(index) }))
      .filter((c) => c.spent > 0)
      .sort((a, b) => b.spent - a.spent);

    const totalSpent = summary.totalSpent;
    if (totalSpent <= 0) return [];

    let cumulative = 0;
    return spending.map((c) => {
      const share = (c.spent / totalSpent) * 100;
      const length = (share / 100) * CIRCUMFERENCE;
      const slice: CategorySlice = {
        name: c.name,
        icon: c.icon,
        color: c.color,
        spent: c.spent,
        share,
        dashArray: `${length} ${CIRCUMFERENCE - length}`,
        dashOffset: -cumulative,
      };
      cumulative += length;
      return slice;
    });
  }

  get canGoToPreviousMonth(): boolean {
    if (!this.summary) return false;
    return this.monthKeys.indexOf(this.summary.monthKey) > 0;
  }

  get canGoToNextMonth(): boolean {
    if (!this.summary) return false;
    return this.monthKeys.indexOf(this.summary.monthKey) < this.monthKeys.length - 1;
  }

  async goToPreviousMonth(): Promise<void> {
    if (!this.summary || !this.canGoToPreviousMonth) return;
    const index = this.monthKeys.indexOf(this.summary.monthKey);
    await this.load(this.monthKeys[index - 1]);
  }

  async goToNextMonth(): Promise<void> {
    if (!this.summary || !this.canGoToNextMonth) return;
    const index = this.monthKeys.indexOf(this.summary.monthKey);
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
}
