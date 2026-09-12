export interface TransactionViewModel {
  id: string;
  date: string;
  amount: number;
  note: string | null;
  categoryName: string;
  categoryIcon: string | null;
  categoryColor: string | null;
}

export interface MonthTransactionsGroup {
  monthKey: string;
  monthLabel: string;
  total: number;
  transactions: TransactionViewModel[];
}
