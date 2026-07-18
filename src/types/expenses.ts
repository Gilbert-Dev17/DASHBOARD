import { ExpenseCategory, Transaction, Wallet, WalletSnapshot  } from "./database";

export type TransactionHistory = Transaction & {
  expense_categories: Pick<ExpenseCategory, 'icon' | 'name' | 'color'> | null;
  wallets: Pick<Wallet, 'name' | 'currency'> | null;
};

export type Wallets = Wallet;

export type WalletHistory = WalletSnapshot;

export type WalletSummary = Wallet;

export type CategorySummary = Pick<ExpenseCategory, 'name' | 'color' | 'icon'> & {
  total?: number;
};

export type { Transaction };