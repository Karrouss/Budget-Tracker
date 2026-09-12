import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { SharedModule } from '../../shared/shared.module';
import { TransactionsPage } from './transactions.page';
import { TransactionsPageRoutingModule } from './transactions-routing.module';

@NgModule({
  imports: [CommonModule, IonicModule, SharedModule, TransactionsPageRoutingModule],
  declarations: [TransactionsPage],
})
export class TransactionsPageModule {}
