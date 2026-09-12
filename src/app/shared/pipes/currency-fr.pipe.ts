import { Pipe, PipeTransform } from '@angular/core';
import { formatCurrency } from '../../core/utils/currency.util';

@Pipe({ name: 'currencyFr', standalone: false })
export class CurrencyFrPipe implements PipeTransform {
  transform(amount: number | null | undefined): string {
    return formatCurrency(amount ?? 0);
  }
}
