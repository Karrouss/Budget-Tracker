import { PaymentMethod } from './expense.model';

export interface TransactionViewModel {
  id: string;
  date: string;
  amount: number;
  note: string | null;
  paymentMethod: PaymentMethod | null;
  categoryName: string;
  categoryIcon: string | null;
  categoryColor: string | null;
}

export interface MonthTransactionsGroup {
  monthKey: string;
  monthLabel: string;
  total: number;
  totalCash: number;
  transactions: TransactionViewModel[];
}
