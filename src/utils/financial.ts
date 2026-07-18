import { WalletSummary, WalletHistory, TransactionHistory } from "@/types/expenses";

export function calculateFinancialTotals(
  wallets?: WalletSummary[] | null,
  historicalSnapshots?: WalletHistory[] | null,
  transactions?: TransactionHistory[] | null
) {
    const safeWallets = wallets || [];
    const safeSnapshots = historicalSnapshots || [];
    const safeTransactions = transactions || [];

    const isAsset = (type?: string) => ['Debit', 'Assets', 'Stocks', 'Crypto'].includes(type || '');
    const isLiability = (type?: string) => ['Credit', 'Loans'].includes(type || '');

    const assets = safeWallets.filter(w => isAsset(w.type));
    const liabilities = safeWallets.filter(w => isLiability(w.type));

    const totalAssets = assets.reduce((sum, w) => sum + w.balance, 0);
    const totalLiabilities = liabilities.reduce((sum, w) => sum + w.balance, 0);
    const netWorth = totalAssets - totalLiabilities;

    // ── Calculate Historical Net Worth ──
    let historicalAssets = 0;
    let historicalLiabilities = 0;

    safeSnapshots.forEach(snap => {
      const currentWallet = safeWallets.find(w => w.id === snap.wallet_id);
      if (currentWallet) {
        if (isAsset(currentWallet.type)) historicalAssets += snap.balance;
        else if (isLiability(currentWallet.type)) historicalLiabilities += snap.balance;
      }
    });

    const historicalNetWorth = historicalAssets - historicalLiabilities;

    // ── Calculate Trend Percentage ──
    let trendPercentage: number | null = null;
    if (safeSnapshots.length > 0 && historicalNetWorth !== 0) {
      trendPercentage = Number((((netWorth - historicalNetWorth) / Math.abs(historicalNetWorth)) * 100).toFixed(1));
    } else if (safeSnapshots.length > 0 && historicalNetWorth === 0 && netWorth > 0) {
      trendPercentage = 100.0;
    }

    // ── Calculate Income & Expense ──
    let income = 0;
    let expense = 0;
    safeTransactions.forEach(t => {
        if (t.type === 'income') income += Number(t.amount);
        if (t.type === 'expense') expense += Number(t.amount);
    });

    return {
        netWorth,
        trendPercentage,
        income,
        expense,
        currency: safeWallets.length > 0 ? safeWallets[0].currency : 'PHP'
    };
}
