// !!! must use only one source of truth then omit or something to only get a copy of what's needed

export interface User {
    id: string; // UUID from auth.users
    name?: string;
    first_name: string;
    last_name: string;
    email: string;
    avatar_url?: string;
    status: string; // e.g. 'on_boarding'
    created_at: string;
}

export interface TaskCategory {
    id: string; // UUID
    user_id: string; // UUID
    name: string;
    created_at: string;
}

export interface Task {
    id: string; // UUID
    user_id: string; // UUID
    task_category_id: string | null; // UUID
    task_name: string;
    time?: string;
    is_done: boolean;
    created_for_date: string; // YYYY-MM-DD
    created_at: string;
}

export interface Subtask {
    id: string; //UUID
    task_id: string; // UUID
    subtask_name: string;
    is_done: boolean;
    created_at: string;
}

// * Expenses

export interface ExpenseCategory {
    id: string; // UUID
    user_id: string; // UUID
    name: string;
    icon?: string;
    color?: string;
    created_at: string;
}

export type AssetType = 'Debit' | 'Assets' | 'Stocks' | 'Crypto';
export type LiabilityType = 'Credit' | 'Loans';
export type WalletType = AssetType | LiabilityType;

export interface Wallet {
    id: string; // UUID
    user_id: string; // UUID
    name: string;
    balance: number;
    currency: string;
    type: WalletType;
    icon?: string;
    color?: string;
    created_at: string;
}

export interface WalletSnapshot {
    id: string; // UUID
    user_id: string; // UUID
    wallet_id: string; // UUID
    balance: number;
    recorded_at: string; // Timestamp
}

export type TransactionType = 'income' | 'expense' | 'transfer';

export interface Transaction {
    id: string; // UUID
    user_id: string; // UUID
    wallet_id: string; // UUID
    category_id: string | null; // UUID
    title: string;
    amount: number;
    type: TransactionType;
    transferFee: number;
    created_for_date: string; // YYYY-MM-DD
    created_at: string;
}