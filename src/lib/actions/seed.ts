'use server';

import { supabaseAdmin } from "@/lib/supabase/admin";
import { randomUUID } from "crypto";

// -----------------------------
// Type Definitions (from database.ts)
// -----------------------------
type AssetType = 'Debit' | 'Assets' | 'Stocks' | 'Crypto';
type LiabilityType = 'Credit' | 'Loans';
type WalletType = AssetType | LiabilityType;
type TransactionType = 'income' | 'expense' | 'transfer';

interface ExpenseCategory {
    id: string;
    user_id: string;
    name: string;
    icon?: string;
    color?: string;
    created_at: string;
}

interface Wallet {
    id: string;
    user_id: string;
    name: string;
    balance: number;
    currency: string;
    type: WalletType;
    icon?: string;
    color?: string;
    created_at: string;
}

interface WalletSnapshot {
    id: string;
    user_id: string;
    wallet_id: string;
    balance: number;
    recorded_at: string;
}

interface Transaction {
    id: string;
    user_id: string;
    wallet_id: string;
    category_id: string | null;
    title: string;
    amount: number;
    type: TransactionType;
    transferFee: number;
    created_for_date: string;
    created_at: string;
}

// -----------------------------
// Seeder Function
// -----------------------------
export async function seedDummyData() {
  const USER_ID = "f5a313e9-0012-4f9c-8ce5-08707200b367";

  // 1️⃣ CATEGORIES
  const categoryTemplates = [
    { name: "Groceries", icon: "ShoppingCart", color: "#10b981" }, // Emerald
    { name: "Rent", icon: "Home", color: "#f43f5e" }, // Rose
    { name: "Utilities", icon: "Zap", color: "#eab308" }, // Yellow
    { name: "Entertainment", icon: "Tv", color: "#8b5cf6" }, // Violet
    { name: "Dining Out", icon: "Utensils", color: "#f97316" }, // Orange
    { name: "Transportation", icon: "Car", color: "#3b82f6" }, // Blue
    { name: "Salary", icon: "Briefcase", color: "#14b8a6" }, // Teal
  ];

  const categories: ExpenseCategory[] = categoryTemplates.map((cat) => ({
    id: randomUUID(),
    user_id: USER_ID,
    name: cat.name,
    icon: cat.icon,
    color: cat.color,
    created_at: new Date().toISOString(),
  }));

  const { error: catError } = await supabaseAdmin.from("expense_categories").insert(categories);
  if (catError) console.error("Error inserting categories:", catError);

  // 2️⃣ WALLETS
  const walletTemplates = [
    { name: "Main Bank Account", type: "Debit" as WalletType, currency: "USD", icon: "Landmark", color: "#3b82f6", balance: 12500 },
    { name: "Cash Wallet", type: "Assets" as WalletType, currency: "USD", icon: "Banknote", color: "#10b981", balance: 450 },
    { name: "Credit Card", type: "Credit" as WalletType, currency: "USD", icon: "CreditCard", color: "#f43f5e", balance: -1250 },
    { name: "Crypto Portfolio", type: "Crypto" as WalletType, currency: "USD", icon: "Bitcoin", color: "#f59e0b", balance: 3420 },
  ];

  const wallets: Wallet[] = walletTemplates.map((w) => ({
    id: randomUUID(),
    user_id: USER_ID,
    name: w.name,
    balance: w.balance,
    currency: w.currency,
    type: w.type,
    icon: w.icon,
    color: w.color,
    created_at: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
  }));

  const { error: walletError } = await supabaseAdmin.from("wallets").insert(wallets);
  if (walletError) console.error("Error inserting wallets:", walletError);

  // 3️⃣ WALLET SNAPSHOTS (Historical Data for Net Worth Trends)
  const snapshots: WalletSnapshot[] = [];

  for (const wallet of wallets) {
    // Generate daily snapshots for the past 60 days
    let currentBalance = wallet.balance * 0.7; // Start at 70% of current balance 60 days ago

    for (let i = 60; i >= 0; i--) {
      // Fluctuate the balance slightly each day to simulate real growth/spending
      const dailyChange = (Math.random() * 200) - 80; // Random change between -80 and +120
      currentBalance += dailyChange;

      // Force the final snapshot (i=0) to exactly equal the current wallet balance
      if (i === 0) currentBalance = wallet.balance;

      snapshots.push({
        id: randomUUID(),
        user_id: USER_ID,
        wallet_id: wallet.id,
        balance: Math.round(currentBalance * 100) / 100,
        recorded_at: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString(),
      });
    }
  }

  const { error: snapshotError } = await supabaseAdmin.from("wallet_snapshots").insert(snapshots);
  if (snapshotError) console.error("Error inserting snapshots:", snapshotError);

  // 4️⃣ TRANSACTIONS
  const transactions: Transaction[] = [];
  const titles = ["Grocery Run", "Monthly Rent", "Netflix Subscription", "Dinner with Friends", "Gas Station", "Salary Deposit", "Coffee", "Freelance Gig"];

  for (const wallet of wallets) {
    const numTransactions = Math.floor(Math.random() * 15) + 15; // 15-30 transactions per wallet

    for (let i = 0; i < numTransactions; i++) {
      const type = wallet.type === 'Credit' ? 'expense' : (Math.random() > 0.3 ? 'expense' : 'income');
      const randomCategory = categories[Math.floor(Math.random() * categories.length)];

      // Pick a random date within the last 60 days
      const daysAgo = Math.floor(Math.random() * 60);
      const transactionDate = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000);
      const dateString = transactionDate.toISOString().split('T')[0]; // YYYY-MM-DD

      transactions.push({
        id: randomUUID(),
        user_id: USER_ID,
        wallet_id: wallet.id,
        category_id: type === 'expense' ? randomCategory.id : null, // Income usually has no category or a specific one
        title: type === 'expense' ? titles[Math.floor(Math.random() * (titles.length - 2))] : "Salary Deposit",
        amount: type === 'expense' ? parseFloat((Math.random() * 150 + 5).toFixed(2)) : parseFloat((Math.random() * 2000 + 500).toFixed(2)),
        type: type as TransactionType,
        transferFee: 0,
        created_for_date: dateString,
        created_at: transactionDate.toISOString(),
      });
    }
  }

  const { error: transactionError } = await supabaseAdmin.from("transactions").insert(transactions);
  if (transactionError) console.error("Error inserting transactions:", transactionError);

  return {
    success: true,
    categories: categories.length,
    wallets: wallets.length,
    snapshots: snapshots.length,
    transactions: transactions.length
  };
}
