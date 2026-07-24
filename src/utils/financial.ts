import { WalletSummary, WalletHistory, TransactionHistory } from "@/types/expenses";

export type FinancialTotals = {
  netWorth: number;
  trendPercentage: number | null;
  income: number;
  expense: number;
  currency: string;
}

export function calculateFinancialTotals(
  wallets?: WalletSummary[] | null,
  historicalSnapshots?: WalletHistory[] | null,
  transactions?: TransactionHistory[] | null
): Record<string, FinancialTotals> {
    const safeWallets = wallets || [];
    const safeSnapshots = historicalSnapshots || [];
    const safeTransactions = transactions || [];

    const isAsset = (type?: string) => ['Debit', 'Assets', 'Stocks', 'Crypto'].includes(type || '');
    const isLiability = (type?: string) => ['Credit', 'Loans'].includes(type || '');

    // Group wallets by currency
    const currencies = Array.from(new Set(safeWallets.map(w => w.currency || 'PHP')));
    const totalsByCurrency: Record<string, FinancialTotals> = {};

    if (currencies.length === 0) {
      // Default fallback
      totalsByCurrency['PHP'] = { netWorth: 0, trendPercentage: null, income: 0, expense: 0, currency: 'PHP' };
      return totalsByCurrency;
    }

    currencies.forEach(currency => {
      const currencyWallets = safeWallets.filter(w => (w.currency || 'PHP') === currency);
      
      const assets = currencyWallets.filter(w => isAsset(w.type));
      const liabilities = currencyWallets.filter(w => isLiability(w.type));

      const totalAssets = assets.reduce((sum, w) => sum + w.balance, 0);
      const totalLiabilities = liabilities.reduce((sum, w) => sum + w.balance, 0);
      const netWorth = totalAssets - totalLiabilities;

      // Historical Net Worth
      let historicalAssets = 0;
      let historicalLiabilities = 0;

      // Extract the oldest snapshot for each wallet to calculate the 30-day delta
      const oldestSnapshotsByWallet = new Map<string, WalletHistory>();
      safeSnapshots.forEach(snap => {
         const current = oldestSnapshotsByWallet.get(snap.wallet_id);
         if (!current || new Date(snap.recorded_at) < new Date(current.recorded_at)) {
            oldestSnapshotsByWallet.set(snap.wallet_id, snap);
         }
      });

      oldestSnapshotsByWallet.forEach(snap => {
        const currentWallet = currencyWallets.find(w => w.id === snap.wallet_id);
        if (currentWallet) {
          if (isAsset(currentWallet.type)) historicalAssets += snap.balance;
          else if (isLiability(currentWallet.type)) historicalLiabilities += snap.balance;
        }
      });

      const historicalNetWorth = historicalAssets - historicalLiabilities;

      let trendPercentage: number | null = null;
      if (safeSnapshots.length > 0 && historicalNetWorth !== 0) {
        trendPercentage = Number((((netWorth - historicalNetWorth) / Math.abs(historicalNetWorth)) * 100).toFixed(1));
      } else if (safeSnapshots.length > 0 && historicalNetWorth === 0 && netWorth > 0) {
        trendPercentage = 100.0;
      }

      // Income & Expense
      let income = 0;
      let expense = 0;
      safeTransactions.forEach(t => {
          // Find if this transaction belongs to a wallet of this currency
          const txWallet = safeWallets.find(w => w.id === t.wallet_id);
          if (txWallet && (txWallet.currency || 'PHP') === currency) {
            if (t.type === 'income') income += Number(t.amount);
            if (t.type === 'expense') expense += Number(t.amount);
          }
      });

      totalsByCurrency[currency] = {
        netWorth,
        trendPercentage,
        income,
        expense,
        currency
      };
    });

    return totalsByCurrency;
}
