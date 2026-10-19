import { PaymentMethod } from './expense.model';

export interface TransactionViewModel {
  id: string;
  monthlyCategoryId: string;
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
  /** Only the current month's expenses can be edited. */
  isCurrentMonth: boolean;
  transactions: TransactionViewModel[];
}
