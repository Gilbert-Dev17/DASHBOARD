import { Task, Subtask, User, Wallet, WalletSnapshot, DailyNote, ExpenseCategory, Transaction } from './database';

export interface TaskWithSubtasks extends Omit<Task, 'task_category_id'> {
  subtasks: Subtask[];
  task_category: { id: string | null; name: string } | null; // nullable — see issue #4
}

export type Notes = DailyNote;

export type UserSummary = Pick<User, 'id'> & Partial<Pick<User, 'email' | 'first_name' | 'name' | 'avatar_url' | 'activeCurrency'>>;

// Wallet related types
export type WalletSummary = Wallet;
export type Wallets = Wallet;
export type WalletHistory = WalletSnapshot;

// Transaction and Category related types
export type TransactionHistory = Transaction & {
  expense_categories: Pick<ExpenseCategory, 'icon' | 'name' | 'color'> | null;
  wallets: Pick<Wallet, 'name' | 'currency'> | null;
};

export type CategorySummary = Pick<ExpenseCategory, 'name' | 'color' | 'icon'> & {
  total?: number;
};

export type CategoryWithTotal = ExpenseCategory & { total_expense: number, currency: string };

export type { Transaction };
