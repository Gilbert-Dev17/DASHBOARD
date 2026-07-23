import Link from 'next/link'
import { Button } from '../ui/button'
import {
  Timeline, TimelineItem, TimelineTime, TimelineContent
 } from '@/components/ui/timeline'
 import { formatSignedCurrency, getSignedAmount } from '@/utils/currency'
 import { TransactionHistory } from '@/types/expenses'
 import { ArrowRight } from 'lucide-react'

 interface RecentLogsSectionProps {
   transactions: TransactionHistory[];
 }

export const RecentLogsSection = ({ transactions }: RecentLogsSectionProps) => {
  return (
    <section className="flex flex-col h-full" aria-labelledby="logs-heading">
      <header className="flex flex-row justify-between items-center pb-4 mb-2 shrink-0">
        <h2 id="logs-heading" className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Transactions</h2>
        <Button variant="link" size="sm" className="group px-0 flex flex-row text-muted-foreground hover:text-foreground items-center gap-1" asChild>
          <Link href="/finance/viewAll">
            View All <ArrowRight size={16} className="transition-transform duration-300 group-hover:translate-x-1" />
          </Link>
        </Button>
      </header>
      {transactions.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center py-16 text-muted-foreground text-sm">
          No Transactions yet.
        </div>
      ) : (
        <div className="flex-1 min-h-0 max-h-100 pr-4 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">

        <Timeline>
          {transactions.map((txn) => {
            const dateObj = new Date(txn.created_for_date || new Date());
            const signedAmount = getSignedAmount({
              amount: Number(txn.amount),
              transaction_type: txn.type,
              wallet_id: txn.wallet_id,
              to_wallet_id: (txn as any).to_wallet_id || null
            }, txn.wallet_id)

            const isPositive = signedAmount > 0;
            const isTransfer = txn.type === 'transfer';

            const colorClass = isTransfer ? 'text-muted-foreground' : isPositive
            ? 'text-emerald-500' : 'text-rose-500';

            return (
              <TimelineItem key={txn.id || txn.created_for_date}>
                <TimelineTime dateTime={txn.created_for_date || ''}>
                  {dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </TimelineTime>

                <TimelineContent>
                  <div className="flex flex-col py-2 px-3 -ml-3 rounded-lg hover:bg-secondary/40 transition-colors">
                    <div className="flex justify-between items-start gap-4">
                      <span className="font-medium text-sm leading-tight text-foreground/90 group-hover:text-foreground">{txn.title}</span>
                      <span className={`tabular-nums font-mono shrink-0 ${colorClass}`}>
                        {formatSignedCurrency(signedAmount, txn.wallets?.currency, !isTransfer)}
                      </span>
                    </div>
                    <span className="text-[10px] uppercase tracking-wider text-muted-foreground/80 mt-1 flex items-center gap-2">
                      <span>{txn.expense_categories?.name || txn.type}</span>
                      {txn.wallets?.name && (
                        <>
                          <span className="w-1 h-1 rounded-full bg-muted-foreground/40" />
                          <span className="text-muted-foreground">{txn.wallets?.name}</span>
                        </>
                      )}
                    </span>
                  </div>
                </TimelineContent>
              </TimelineItem>
            )
          })}
        </Timeline>
        </div>
      )}
    </section>
  )
}
