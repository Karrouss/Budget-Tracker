import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActionSheetController, ModalController } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { DashboardService } from '../../core/services/dashboard.service';
import { MonthService } from '../../core/services/month.service';
import { DashboardRefreshService } from '../../core/services/dashboard-refresh.service';
import { SelectedMonthService } from '../../core/services/selected-month.service';
import { ThemeService } from '../../core/services/theme.service';
import { CategoryCardViewModel, DashboardSummary } from '../../core/models';
import { fallbackColorForIndex } from '../../core/utils/category-presets';
import { CategoryFormComponent } from '../../shared/components/category-form/category-form.component';

@Component({
  selector: 'app-dashboard',
  templateUrl: 'dashboard.page.html',
  styleUrls: ['dashboard.page.scss'],
  standalone: false,
})
export class DashboardPage implements OnInit, OnDestroy {
  summary: DashboardSummary | null = null;
  loading = true;

  private monthKeys: string[] = [];
  private refreshSubscription?: Subscription;
  private monthSyncSubscription?: Subscription;

  constructor(
    private readonly dashboardService: DashboardService,
    private readonly monthService: MonthService,
    private readonly dashboardRefresh: DashboardRefreshService,
    private readonly selectedMonth: SelectedMonthService,
    private readonly themeService: ThemeService,
    private readonly modalCtrl: ModalController,
    private readonly actionSheetCtrl: ActionSheetController,
  ) {}

  readonly themeMode$ = this.themeService.mode$;

  async toggleTheme(): Promise<void> {
    await this.themeService.toggle();
  }

  async ngOnInit(): Promise<void> {
    await this.load(this.selectedMonth.value);
    this.refreshSubscription = this.dashboardRefresh.changes$.subscribe(() => this.load(this.summary?.monthKey));
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
    this.loading = false;
    this.selectedMonth.select(this.summary.monthKey);
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

  async openAddCategory(): Promise<void> {
    const modal = await this.modalCtrl.create({ component: CategoryFormComponent });
    await modal.present();
  }

  async openEditCategory(card: CategoryCardViewModel): Promise<void> {
    const modal = await this.modalCtrl.create({
      component: CategoryFormComponent,
      componentProps: { category: card },
    });
    await modal.present();
  }

  fallbackColor(index: number): string {
    return fallbackColorForIndex(index);
  }
}
