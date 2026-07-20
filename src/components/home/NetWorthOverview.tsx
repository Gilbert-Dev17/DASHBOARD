'use client'

import { TrendingUp, TrendingDown, Wallet } from 'lucide-react'
import { WalletSummary, WalletHistory } from '@/types/dashboard'
import { formatCurrency, formatSignedCurrency } from '@/utils/currency'
import { calculateFinancialTotals } from '@/utils/financial'
import { AVAILABLE_ICONS } from '@/lib/constants/categories'

interface NetWorthProps {
  wallets: WalletSummary[];
  historicalSnapshots?: WalletHistory[];
}

export const NetWorthOverview = ({ wallets, historicalSnapshots = [] }: NetWorthProps) => {

  const totalsByCurrency = calculateFinancialTotals(wallets, historicalSnapshots);
  const currencyBlocks = Object.values(totalsByCurrency);

  return (
    <div className="w-full flex flex-col gap-10">
      {currencyBlocks.map((totals) => {
        const { netWorth, trendPercentage, currency } = totals;
        const [nwDollars, nwCents] = formatSignedCurrency(netWorth, currency).split('.');

        return (
          <section key={currency} aria-labelledby={`finances-heading-${currency}`} className="flex flex-col gap-4">
            <div className="flex items-center gap-4 mb-2">
              <h2 id={`finances-heading-${currency}`} className="text-xs font-semibold uppercase tracking-[0.2em] text-foreground">
                Net Worth ({currency})
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
              {nwDollars}
              {nwCents && <span className="text-2xl md:text-3xl text-muted-foreground">.{nwCents}</span>}
            </div>
            <p className="text-xs lg:text-sm text-muted-foreground font-medium max-w-sm">
              {trendPercentage === null
                ? "Waiting for 30 days of data to calculate your first trend."
                : trendPercentage >= 0
                  ? `Up ${trendPercentage}% from last month's snapshots.`
                  : `Down ${Math.abs(trendPercentage)}% from last month's snapshots.`}
            </p>
          </section>
        );
      })}
    </div>
  )
}
