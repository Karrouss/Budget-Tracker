export type PaymentMethod = 'cash' | 'card';

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  cash: 'Cash',
  card: 'CB',
};

export interface Expense {
  id: string;
  monthlyCategoryId: string;
  amount: number;
  date: string; // ISO date
  note: string | null;
  /** Missing on expenses recorded before the payment method was introduced. */
  paymentMethod?: PaymentMethod;
  createdAt: string;
  updatedAt: string;
}

export type ExpenseInput = Pick<Expense, 'monthlyCategoryId' | 'amount' | 'date' | 'note'> & {
  paymentMethod: PaymentMethod;
};
