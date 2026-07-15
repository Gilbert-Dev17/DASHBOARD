'use client'

import { TrendingUp, TrendingDown } from 'lucide-react'
import { WalletSummary, WalletHistory } from '@/types/dashboard'
import { formatCurrency } from '@/utils/currency'

interface NetWorthProps {
  wallets: WalletSummary[];
  historicalSnapshots?: WalletHistory[];
}

export const NetWorthOverview = ({ wallets, historicalSnapshots = [] }: NetWorthProps) => {
  const safeWallets = wallets || []

  const isAsset = (type?: any) => ['Debit', 'Assets', 'Stocks', 'Crypto'].includes(type as string);
  const isLiability = (type?: any) => ['Credit', 'Loans'].includes(type as string);

  const assets = safeWallets.filter(w => isAsset(w.type))
  const liabilities = safeWallets.filter(w => isLiability(w.type))

  const totalAssets = assets.reduce((sum, w) => sum + w.balance, 0)
  const totalLiabilities = liabilities.reduce((sum, w) => sum + w.balance, 0)
  const netWorth = totalAssets - totalLiabilities

  // ── Calculate Historical Net Worth ──
  let historicalAssets = 0;
  let historicalLiabilities = 0;

  historicalSnapshots.forEach(snap => {
    const currentWallet = safeWallets.find(w => w.id === snap.wallet_id);
    if (currentWallet) {
      if (isAsset(currentWallet.type)) historicalAssets += snap.balance;
      else if (isLiability(currentWallet.type)) historicalLiabilities += snap.balance;
    }
  });

  const historicalNetWorth = historicalAssets - historicalLiabilities;

  // ── Calculate Trend Percentage ──
  let trendPercentage: number | null = null;
  if (historicalSnapshots.length > 0 && historicalNetWorth !== 0) {
    trendPercentage = Number((((netWorth - historicalNetWorth) / Math.abs(historicalNetWorth)) * 100).toFixed(1));
  } else if (historicalSnapshots.length > 0 && historicalNetWorth === 0 && netWorth > 0) {
    trendPercentage = 100.0; // Infinite growth from 0 is just treated as +100% usually, or just leave it out
  }

  const currency = safeWallets.length > 0 ? safeWallets[0].currency : 'USD'
  const [nwDollars, nwCents] = formatCurrency(netWorth, currency).split('.')

  return (
    <section aria-labelledby="finances-heading" className="w-full flex flex-col gap-6">
      {/* ── Net Worth Main Display ── */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-4 mb-2">
          <h2 id="finances-heading" className="text-xs font-semibold uppercase tracking-[0.2em] text-foreground">
            Net Worth
          </h2>
          {trendPercentage !== null && (
            <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-medium ${
              trendPercentage >= 0 ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'
            }`}>
              {trendPercentage >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
              {trendPercentage > 0 ? '+' : ''}{trendPercentage}%
            </div>
          )}
        </div>
        <div className="text-5xl md:text-6xl font-mono text-accent tracking-tighter tabular-nums flex items-baseline gap-1">
          {netWorth < 0 ? '-' : ''}{nwDollars.replace('-', '')}
          {nwCents && <span className="text-2xl md:text-3xl text-muted-foreground">.{nwCents}</span>}
        </div>
        <p className="text-xs lg:text-sm text-muted-foreground/70 font-medium max-w-sm">
          {trendPercentage === null
            ? "Waiting for 30 days of data to calculate your first trend."
            : trendPercentage >= 0
              ? `Up ${trendPercentage}% from last month's snapshots.`
              : `Down ${Math.abs(trendPercentage)}% from last month's snapshots.`}
        </p>
      </div>
    </section>
  )
}
