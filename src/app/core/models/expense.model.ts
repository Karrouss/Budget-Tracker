export interface Expense {
  id: string;
  monthlyCategoryId: string;
  amount: number;
  date: string; // ISO date
  note: string | null;
  createdAt: string;
  updatedAt: string;
}

export type ExpenseInput = Pick<Expense, 'monthlyCategoryId' | 'amount' | 'date' | 'note'>;
