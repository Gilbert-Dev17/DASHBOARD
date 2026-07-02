export interface Transaction {
  // id: string | number;
  date: string;
  note: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  currency: string;
}

export interface CategorySummary {
  // id: string;
  name: string;
  total: number;
  iconKey: string;
}

export interface FinancialSummary {
  balance: number;
  income: number;
  expense: number;
  currency: string;
}