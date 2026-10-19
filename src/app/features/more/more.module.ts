import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { SharedModule } from '../../shared/shared.module';
import { MorePage } from './more.page';
import { MorePageRoutingModule } from './more-routing.module';

@NgModule({
  imports: [CommonModule, FormsModule, IonicModule, SharedModule, MorePageRoutingModule],
  declarations: [MorePage],
})
export class MorePageModule {}
