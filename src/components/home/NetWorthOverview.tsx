'use client'

import React from 'react'
import { WalletSummary } from '@/types/dashboard'
import { Card, CardContent } from '@/components/ui/card'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { formatCurrency } from '@/utils/currency'

interface NetWorthProps { wallets: WalletSummary[] }

export const NetWorthOverview = ({ wallets }: NetWorthProps) => {
  const safeWallets = wallets || []

  // Default to asset if type is null to gracefully handle old data before the schema migration
  const assets = safeWallets.filter(w => w.type === 'asset' || !w.type)
  const liabilities = safeWallets.filter(w => w.type === 'liability')

  const totalAssets = assets.reduce((sum, w) => sum + w.balance, 0)
  const totalLiabilities = liabilities.reduce((sum, w) => sum + w.balance, 0)
  const netWorth = totalAssets - totalLiabilities

  // Default to USD if no wallets exist, otherwise use the first wallet's currency
  const currency = safeWallets.length > 0 ? safeWallets[0].currency : 'PHP'
  const [nwDollars, nwCents] = formatCurrency(netWorth, currency).split('.')

  return (
    <section aria-labelledby="finances-heading" className="w-full flex flex-col gap-6">
      {/* ── Net Worth Main Display ── */}
      <div className="flex flex-col gap-4">
        <h2 id="finances-heading" className="text-xs font-semibold uppercase tracking-[0.2em] text-foreground">
          Net Worth
        </h2>
        <div className="text-5xl md:text-6xl font-light text-accent tracking-tighter tabular-nums flex items-baseline gap-1">
          {netWorth < 0 ? '-' : ''}{nwDollars.replace('-', '')}
          {nwCents && <span className="text-2xl md:text-3xl text-muted-foreground">.{nwCents}</span>}
        </div>
      </div>

      {/* ── Summary Cards ── */}
      <div className="grid grid-cols-2 gap-4">
        <Card variant="dashed" className="transition-colors hover:bg-card/60 rounded-md">
          <CardContent className="p-4 flex flex-col gap-1">
            <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">Assets</span>
            <span className="text-lg tabular-nums text-foreground/90">{formatCurrency(totalAssets, currency)}</span>
          </CardContent>
        </Card>

        <Card variant="dashed" className="transition-colors hover:bg-card/60 rounded-md">
          <CardContent className="p-4 flex flex-col gap-1">
            <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">Liabilities</span>
            <span className="text-lg tabular-nums text-foreground/90">{formatCurrency(totalLiabilities, currency)}</span>
          </CardContent>
        </Card>
      </div>

      {safeWallets.length > 0 && (
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="breakdown" className="border-b-0">
            <AccordionTrigger className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground hover:no-underline hover:text-foreground py-2">
              View Breakdown
            </AccordionTrigger>
            <AccordionContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 pt-4 pb-2">

                {/* Assets List */}
                <div className="flex flex-col gap-3">
                  <h3 className="text-[10px] uppercase tracking-[0.15em] text-accent border-b border-dashed border-border/50 pb-1">Asset Accounts</h3>
                  {assets.length === 0 ? (
                     <span className="text-xs text-muted-foreground italic">No assets recorded.</span>
                  ) : (
                    <ul className="flex flex-col gap-2">
                      {assets.map(a => (
                        <li key={a.id} className="flex justify-between items-center text-sm">
                          <span className="text-foreground/80">{a.name}</span>
                          <span className="tabular-nums font-medium">{formatCurrency(a.balance)}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                {/* Liabilities List */}
                <div className="flex flex-col gap-3">
                  <h3 className="text-[10px] uppercase tracking-[0.15em] text-destructive/80 border-b border-dashed border-border/50 pb-1">Liability Accounts</h3>
                  {liabilities.length === 0 ? (
                     <span className="text-xs text-muted-foreground italic">No liabilities recorded.</span>
                  ) : (
                    <ul className="flex flex-col gap-2">
                      {liabilities.map(l => (
                        <li key={l.id} className="flex justify-between items-center text-sm">
                          <span className="text-foreground/80">{l.name}</span>
                          <span className="tabular-nums font-medium text-destructive/80">-{formatCurrency(l.balance, currency)}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      )}
    </section>
  )
}
