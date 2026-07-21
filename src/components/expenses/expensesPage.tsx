'use client'

import PageComponent from '@/components/shared/PageComponent'
import { TransactionHistory } from '@/types/expenses'
import type { WalletSummary } from '@/types/dashboard'
import { WalletGrid } from './accounts-Grid'
import { SummaryExpense } from './summary-expense'
import { CategorySection } from './category-section'
import { RecentLogsSection } from './recent-Logs'
import { WalletSnapshot, ExpenseCategory } from '@/types/database'

interface ExpenseTrackerProps {
  transactions: TransactionHistory[];
  wallets: WalletSummary[]
  historicalSnapshots?: WalletSnapshot[];
  allCategories: ExpenseCategory[];
}

export default function ExpenseTrackerPage({ wallets, transactions, historicalSnapshots, allCategories }: ExpenseTrackerProps) {

  return (
    <PageComponent>

       {/* <pre className="bg-muted p-4 rounded text-xs overflow-auto max-h-96">
        {JSON.stringify(transactions, null, 2)}
       </pre> */}

      <SummaryExpense
        wallets={wallets}
        historicalSnapshots={historicalSnapshots}
        transactions={transactions}
      />

      {/* MAIN CONTENT GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 mt-6">
        {/* LEFT COLUMN (Accounts + Categories) */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          <WalletGrid wallets={wallets} />

          <CategorySection transactions={transactions} allCategories={allCategories} currency={wallets[0]?.currency || 'PHP'} />
        </div>

        <div className="lg:col-span-4">
          <RecentLogsSection transactions={transactions} />
        </div>
      </div>
    </PageComponent>
  )
}