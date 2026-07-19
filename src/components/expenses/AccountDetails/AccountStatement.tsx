'use client';

import Link from 'next/link';
import { ArrowLeft, Wallet as WalletIcon, CreditCard, TrendingUp, TrendingDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/utils/currency';
import { Timeline, TimelineItem, TimelineTime, TimelineContent } from '@/components/ui/timeline';
import PageComponent from '@/components/shared/PageComponent';
import { Wallets, TransactionHistory } from '@/types/expenses';

interface AccountStatementProps {
  accountData: (Wallets & { transactions: TransactionHistory[] }) | null
}

export function AccountStatement({accountData} : AccountStatementProps) {

  if (!accountData || !accountData.id) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
        <h2 className="text-2xl font-semibold mb-2">Account Not Found</h2>
        <p className="text-muted-foreground mb-6">We couldn't find the account you're looking for.</p>
        <Link href="/finance">
          <Button variant="outline">Back to Expenses</Button>
        </Link>
      </div>
    );
  }

  return (
    <PageComponent>
    <div className="max-w-4xl mx-auto w-full pt-6">
      {/* HEADER */}
      <header className="flex flex-col gap-6 mb-12">
        <Link href="/finance" className="w-fit">
          <Button variant="ghost" size="sm" className="h-8 px-2 text-muted-foreground hover:text-foreground">
            <ArrowLeft size={14} className="mr-2" />
            Back to Expenses
          </Button>
        </Link>

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className={`p-4 rounded-2xl border `}>
              {/* <Icon size={32} /> */}
            </div>
            <div>
              <h1 className="text-3xl font-light tracking-tight">{accountData.name}</h1>
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
                {accountData.type}
              </span>
            </div>
          </div>

          <div className="flex flex-col md:text-right">
            <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-semibold mb-1">Current Balance</span>
            <div className={`text-4xl tabular-nums font-mono tracking-tighter flex md:justify-end items-baseline`}>
              {formatCurrency(accountData.balance)}
            </div>
            {/* {wallet.trend !== undefined && (
              <div className={`flex items-center md:justify-end gap-1.5 mt-2 text-[10px] font-medium ${
                wallet.trend >= 0 ? 'text-emerald-500' : 'text-rose-500'
              }`}>
                {wallet.trend >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                {wallet.trend > 0 ? '+' : ''}{wallet.trend}% from last month
              </div>
            )} */}
          </div>
        </div>
      </header>

      {/* TRANSACTIONS SECTION */}
      <section className="bg-card/30 border border-dashed border-border/50 rounded-3xl p-6 md:p-8">
        <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground mb-8">Statement Activity</h2>

        {!accountData.transactions || accountData.transactions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-muted-foreground text-sm">
            No recent activity for this account.
          </div>
        ) : (
          <Timeline>
            {accountData.transactions.map((txn: any, index: number) => {
              const dateObj = new Date(txn.created_for_date || txn.created_at || new Date());
              return (
                <TimelineItem key={`${txn.id}-${index}`}>
                  <TimelineTime dateTime={txn.created_for_date || txn.created_at || ''}>
                    {dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </TimelineTime>

                  <TimelineContent>
                    <div className="flex flex-col py-3 px-4 -ml-4 rounded-xl hover:bg-secondary/40 transition-colors group">
                      <div className="flex justify-between items-start gap-4">
                        <span className="font-medium text-[15px] leading-tight text-foreground/90 group-hover:text-foreground">{txn.title}</span>
                        <span className="tabular-nums font-mono text-base shrink-0 text-foreground">
                          {txn.type === 'income' ? '+' : '-'}{formatCurrency(txn.amount, accountData.currency)}
                        </span>
                      </div>
                      <div className="text-[10px] uppercase tracking-wider text-muted-foreground/80 mt-1.5 flex items-center gap-2">
                        {/* We use category_id for now, unless you joined expense_categories in the query! */}
                        <span>{txn.expense_categories?.name || 'Categorized Transaction'}</span>
                      </div>
                    </div>
                  </TimelineContent>
                </TimelineItem>
              )
            })}
          </Timeline>
        )}
      </section>
    </div>
    </PageComponent>
  );
}
