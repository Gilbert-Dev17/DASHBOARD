import { ExpenseCategory, Transaction, Wallet, WalletSnapshot  } from "./database";

export type TransactionHistory = Transaction;

export type CategorySummary = ExpenseCategory;

export type WalletHistory = WalletSnapshot;

export type WalletSummary = Wallet