import React from 'react'

import Link from 'next/link'
import { Button } from '../ui/button'
import {
  Timeline, TimelineItem, TimelineTime, TimelineContent
 } from '@/components/ui/timeline'
 import { formatCurrency } from '@/utils/currency'
 import { Transaction } from '@/types/expenses'

 interface RecentLogsSectionProps {
   transactions: Transaction[];
 }

export const RecentLogsSection = ({ transactions }: RecentLogsSectionProps) => {
  return (
    <section className="lg:col-span-5 flex flex-col" aria-labelledby="logs-heading">
      <header className="flex flex-row justify-between items-center pb-4 mb-2 shrink-0">
        <h2 id="logs-heading" className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Recent Logs</h2>
        <Button variant="ghost" size="sm" className="text-[10px] uppercase tracking-wider h-8" asChild>
          <Link href="/expenses/viewAll">View All</Link>
        </Button>
      </header>
      {transactions.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center py-16 text-muted-foreground text-sm">
          No recent logs yet.
        </div>
      ) : (
        <Timeline>
          {transactions.map((txn) => {
            const dateObj = new Date(txn.date);
            return (
              <TimelineItem key={txn.date}>
                <TimelineTime dateTime={txn.date}>
                  {dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </TimelineTime>

                <TimelineContent>
                  <div className="flex flex-col py-2 px-3 -ml-3 rounded-lg hover:bg-secondary/40 transition-colors">
                    <div className="flex justify-between items-start gap-4">
                      <span className="font-medium text-sm leading-tight text-foreground/90 group-hover:text-foreground">{txn.note}</span>
                      <span className={`tabular-nums font-mono shrink-0 ${txn.type === 'income' ? 'text-emerald-500' : 'text-foreground'}`}>
                        {txn.type === 'income' ? '+' : '-'}{formatCurrency(txn.amount, txn.currency)}
                      </span>
                    </div>
                    <span className="text-[10px] uppercase tracking-wider text-muted-foreground/80 mt-1 flex items-center gap-2">
                      <span>{txn.category}</span>
                      {txn.walletName && (
                        <>
                          <span className="w-1 h-1 rounded-full bg-muted-foreground/40" />
                          <span className="text-muted-foreground/60">{txn.walletName}</span>
                        </>
                      )}
                    </span>
                  </div>
                </TimelineContent>
              </TimelineItem>
            )
          })}
        </Timeline>
      )}
    </section>
  )
}
