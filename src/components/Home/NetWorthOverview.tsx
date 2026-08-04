'use client'

import { TrendingUp, TrendingDown } from 'lucide-react'
import { WalletSummary, WalletHistory } from '@/types/dashboard'
import { formatSignedCurrency } from '@/utils/currency'
import { calculateFinancialTotals } from '@/utils/financial'
import { Badge } from '../ui/badge'

interface NetWorthProps {
  wallets: WalletSummary[];
  historicalSnapshots?: WalletHistory[];
  activeCurrency: string;
}

export const NetWorthOverview = ({ wallets, historicalSnapshots = [], activeCurrency }: NetWorthProps) => {

  const totalsByCurrency = calculateFinancialTotals(wallets, historicalSnapshots, null, activeCurrency);
  const currencyBlocks = Object.values(totalsByCurrency);

  return (
    <div className="w-full flex flex-col gap-10">
      {currencyBlocks.map((totals) => {
        const { netWorth, trendPercentage, currency } = totals;
        const [nwDollars, nwCents] = formatSignedCurrency(netWorth, currency).split('.');

        return (
          <section key={currency} aria-labelledby={`finances-heading-${currency}`} className="flex flex-col gap-4">
            <div className="flex items-center gap-4 mb-2">
              <h2 id={`finances-heading-${currency}`} className="text-xs font-semibold uppercase tracking-widest text-foreground">
                Net Worth ({currency})
              </h2>
            </div>
            <div className="text-4xl md:text-5xl font-mono text-accent tracking-tighter tabular-nums flex items-baseline gap-1">
              {nwDollars}
              {nwCents && <span className="text-xl md:text-2xl text-muted-foreground">.{nwCents}</span>}
            </div>
            <p className="text-xs lg:text-sm text-muted-foreground font-medium max-w-sm leading-relaxed">
              {trendPercentage === null ? (
                "Waiting for a day of data to calculate your first trend."
              ) : trendPercentage >= 0 ? (
                <span className="inline-flex items-center flex-wrap gap-x-1.5">
                  Up
                  <span className="flex items-center gap-1.5 text-xs font-medium text-emerald-500 ">
                    <TrendingUp size={12} /> {trendPercentage}%
                  </span>
                  from last month&apos;s snapshots.
                </span>
              ) : (
                <span className="inline-flex items-center flex-wrap gap-x-1.5">
                  Down
                  <Badge variant="secondary" className="flex items-center gap-1.5 text-xs font-medium text-rose-500">
                    <TrendingDown size={12} /> {Math.abs(trendPercentage)}%
                  </Badge>
                  from last month&apos;s snapshots.
                </span>
              )}
            </p>
          </section>
        );
      })}
    </div>
  )
}
