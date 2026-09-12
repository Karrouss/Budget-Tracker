import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { CircularBudgetProgressComponent } from './components/circular-budget-progress/circular-budget-progress.component';
import { EmptyStateComponent } from './components/empty-state/empty-state.component';
import { IconColorPickerComponent } from './components/icon-color-picker/icon-color-picker.component';
import { CategoryFormComponent } from './components/category-form/category-form.component';
import { ExpenseFormComponent } from './components/expense-form/expense-form.component';
import { CurrencyFrPipe } from './pipes/currency-fr.pipe';

@NgModule({
  imports: [CommonModule, FormsModule, IonicModule],
  declarations: [
    CircularBudgetProgressComponent,
    EmptyStateComponent,
    IconColorPickerComponent,
    CategoryFormComponent,
    ExpenseFormComponent,
    CurrencyFrPipe,
  ],
  exports: [
    CircularBudgetProgressComponent,
    EmptyStateComponent,
    IconColorPickerComponent,
    CategoryFormComponent,
    ExpenseFormComponent,
    CurrencyFrPipe,
  ],
})
export class SharedModule {}
