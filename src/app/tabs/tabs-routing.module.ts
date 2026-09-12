import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TabsPage } from './tabs.page';

const routes: Routes = [
  {
    path: '',
    component: TabsPage,
    children: [
      {
        path: 'dashboard',
        loadChildren: () =>
          import('../features/dashboard/dashboard.module').then((m) => m.DashboardPageModule),
      },
      {
        path: 'transactions',
        loadChildren: () =>
          import('../features/transactions/transactions.module').then(
            (m) => m.TransactionsPageModule,
          ),
      },
      {
        path: 'stats',
        loadChildren: () =>
          import('../features/stats/stats.module').then((m) => m.StatsPageModule),
      },
      {
        path: 'more',
        loadChildren: () => import('../features/more/more.module').then((m) => m.MorePageModule),
      },
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full',
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TabsPageRoutingModule {}
