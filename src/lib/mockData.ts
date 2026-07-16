import { Bus } from 'lucide-react';
import type { Transaction } from '@/types/expenses';

export const summary = {
  balance: 150250.75, // Net Worth
  income: 850.00,
  expense: 200.00,
  currency: 'USD',
  trend: 5.2
};

export const categories = [
  { name: 'Groceries', total: 120, iconKey: 'groceries' },
  { name: 'Transport', total: 65, iconKey: 'transport' },
  { name: 'Foods & Drinks', total: 15, iconKey: 'foods-drinks' },
];

export const mockWallets = [
  { id: '1', name: 'Main Checking', balance: 5250.75, type: 'asset', trend: 2.1 },
  { id: '2', name: 'Emergency Fund', balance: 10000.00, type: 'asset', trend: 0.5 },
  { id: '3', name: 'Credit Card', balance: 1250.00, type: 'liability', trend: -1.5 },
  { id: '4', name: 'Vanguard Index', balance: 136250.00, type: 'asset', trend: 8.4 },
  { id: '5', name: 'Bitcoing', balance: 136250.00, type: 'asset', trend: 7.4 },
];

export const recentTransactions = [
  { date: '2026-06-11T14:00:00Z', note: 'Uber to Downtown', amount: 65.00, type: 'expense', category: 'Transport', currency: 'USD', walletName: 'Credit Card' },
  { date: '2026-06-10T09:30:00Z', note: 'Common Ground Coffee', amount: 15.00, type: 'expense', category: 'Foods & Drinks', currency: 'USD', walletName: 'Main Checking' },
  { date: '2026-06-09T18:00:00Z', note: 'Freelance Design Work', amount: 850.00, type: 'income', category: 'Income', currency: 'USD', walletName: 'Main Checking' },
  { date: '2026-06-08T12:00:00Z', note: 'Trader Joes Groceries', amount: 120.00, type: 'expense', category: 'Groceries', currency: 'USD', walletName: 'Credit Card' },
] as any[];

export const allTransactions = [
  { id: 1, date: '2026-06-11T14:00:00Z', icon: Bus, name: 'Transport #1 : 100 Market St, San Francisco', category: 'TRANSPORT', amount: 105 },
  { id: 2, date: '2026-06-11T09:00:00Z', icon: Bus, name: 'Transport #2 : 200 Market St, San Francisco', category: 'TRANSPORT', amount: 65 },
  { id: 3, date: '2026-06-10T11:30:00Z', icon: Bus, name: 'Transport #3 : 300 Market St, San Francisco', category: 'TRANSPORT', amount: 80 },
  { id: 4, date: '2026-05-20T16:45:00Z', icon: Bus, name: 'Transport #4 : Oakland', category: 'TRANSPORT', amount: 120 },
];

export const profileStats = {
  tasksCompleted: 142,
  tasksOpen: 12,
  totalExpenses: 45000.50,
};
