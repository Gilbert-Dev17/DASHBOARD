'use client'

import { TrendingUp, TrendingDown } from 'lucide-react'
import { WalletSummary } from '@/types/dashboard'
import { formatCurrency } from '@/utils/currency'
import { summary as mockSummary } from '@/lib/mockData'

interface NetWorthProps { wallets: WalletSummary[] }

export const NetWorthOverview = ({ wallets }: NetWorthProps) => {
  const safeWallets = wallets || []

  const isAsset = (type?: any) => ['Debit', 'Assets', 'Stocks', 'Crypto'].includes(type as string);
  const isLiability = (type?: any) => ['Credit', 'Loans'].includes(type as string);

  const assets = safeWallets.filter(w => isAsset(w.type))
  const liabilities = safeWallets.filter(w => isLiability(w.type))

  const totalAssets = assets.reduce((sum, w) => sum + w.balance, 0)
  const totalLiabilities = liabilities.reduce((sum, w) => sum + w.balance, 0)
  const netWorth = totalAssets - totalLiabilities

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
          {mockSummary.trend !== undefined && (
            <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-medium ${
              mockSummary.trend >= 0 ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'
            }`}>
              {mockSummary.trend >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
              {mockSummary.trend > 0 ? '+' : ''}{mockSummary.trend}%
            </div>
          )}
        </div>
        <div className="text-5xl md:text-6xl font-mono text-accent tracking-tighter tabular-nums flex items-baseline gap-1">
          {netWorth < 0 ? '-' : ''}{nwDollars.replace('-', '')}
          {nwCents && <span className="text-2xl md:text-3xl text-muted-foreground">.{nwCents}</span>}
        </div>
        <p className="text-xs lg:text-sm text-muted-foreground/70 font-medium max-w-sm">
          {mockSummary.trend && mockSummary.trend >= 0
            ? `Up ${mockSummary.trend}% from last month, driven by recent Income.`
            : `Down ${Math.abs(mockSummary.trend || 0)}% from last month, driven by recent Expenses.`}
        </p>
      </div>
    </section>
  )
}
