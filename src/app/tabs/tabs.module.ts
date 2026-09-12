import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { SharedModule } from '../shared/shared.module';
import { TabsPage } from './tabs.page';
import { TabsPageRoutingModule } from './tabs-routing.module';

@NgModule({
  imports: [CommonModule, IonicModule, SharedModule, TabsPageRoutingModule],
  declarations: [TabsPage],
})
export class TabsPageModule {}
