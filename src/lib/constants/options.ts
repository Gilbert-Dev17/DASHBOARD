// CONFIGURATION & LIMITS
export const AUTOSAVE_DELAY = 5000;
export const ITEMS_PER_PAGE = 60;
export const MAX_QUICK_ADD_TASKS = 50;

// DATA VALIDATION
export const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

// UI FILTER OPTIONS
export const TIME_FILTERS = [
  { name: 'Day', value: 'day' },
  { name: 'Week', value: 'week' },
  { name: 'Month', value: 'month' },
  { name: 'Year', value: 'year' },
];

// FINANCE OPTIONS
export const TRANSACTION_TYPE_OPTIONS = [
  { label: 'All Types', value: 'all' },
  { label: 'Expense', value: 'expense' },
  { label: 'Income', value: 'income' },
  { label: 'Transfer', value: 'transfer' },
  { label: 'Adjustment', value: 'adjustment' },
];

export const WALLET_TYPE_OPTIONS = [
  { value: 'Debit', label: 'Debit' },
  { value: 'Credit', label: 'Credit' },
  { value: 'Assets', label: 'Assets' },
  { value: 'Loans', label: 'Loans' },
  { value: 'Stocks', label: 'Stock' },
  { value: 'Crypto', label: 'Crypto' },
];

export interface CurrencyInfo {
  code: string;
  symbol: string;
  name: string;
}

export const CURRENCY_OPTIONS: CurrencyInfo[] = [
  { code: 'PHP', symbol: '₱', name: 'Philippine Peso' },
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
  { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar' },
  { code: 'SGD', symbol: 'S$', name: 'Singapore Dollar' },
];

// TASK OPTIONS
export const TASK_CATEGORY_OPTIONS = [
  'routine',
  'health',
  'work',
  'date',
  'shopping',
  'groceries',
  'errands',
  'education',
  'finance',
  'social',
  'travel',
  'home',
  'maintenance',
  'personal',
  'hobbies',
  'selfcare',
  'family',
  'pets',
  'bills',
  'appointments',
  'school'
] as const;
