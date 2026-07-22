import { useMemo, useState } from 'react';
import type { WalletSummary, UserSummary } from '@/types/dashboard';
import type { TransactionHistory } from '@/types/expenses';

interface UseCurrencyFilterOptions {
  wallets: WalletSummary[];
  user?: UserSummary;
  transactions?: TransactionHistory[];
}

export function useCurrencyFilter({ wallets, user, transactions }: UseCurrencyFilterOptions) {
  const availableCurrencies = useMemo(() => {
    const rawCurrencies = Array.from(new Set(wallets.map(w => w.currency || 'PHP')));
    const pref = user?.activeCurrency;
    return rawCurrencies.sort((a, b) => {
      if (pref && a === pref) return -1;
      if (pref && b === pref) return 1;
      return a.localeCompare(b);
    });
  }, [wallets, user?.activeCurrency]);

  const defaultCurrency = user?.activeCurrency || availableCurrencies[0] || 'PHP';
  const [activeCurrency, setActiveCurrency] = useState(defaultCurrency);

  const filteredWallets = useMemo(() => 
    wallets.filter(w => (w.currency || 'PHP') === activeCurrency), 
  [wallets, activeCurrency]);

  const filteredTransactions = useMemo(() => {
    if (!transactions) return [];
    return transactions.filter(t => {
      const wallet = wallets.find(w => w.id === t.wallet_id);
      return (wallet?.currency || 'PHP') === activeCurrency;
    });
  }, [transactions, wallets, activeCurrency]);

  return {
    availableCurrencies,
    activeCurrency,
    setActiveCurrency,
    filteredWallets,
    filteredTransactions
  };
}
