'use client'

import React from 'react'

import { DrumstickIcon, ShoppingBag, Tv, Heart, ShoppingBasket, BusFront, School } from 'lucide-react'

import PageComponent from '@/components/shared/PageComponent'
import { TransactionHistory } from '@/types/expenses'
import type { WalletSummary } from '@/types/dashboard'
import { WalletCarousel } from './accounts-Carousel'
import { SummaryExpense } from './summary-expense'
import { CategorySection } from './category-section'
import { RecentLogsSection } from './recent-Logs'
import { WalletSnapshot } from '@/types/database'

// Map string keys from the database to Lucide React components
export const ICON_MAP: Record<string, React.ElementType> = {
  'foods-drinks': DrumstickIcon,
  'shopping': ShoppingBag,
  'entertainment': Tv,
  'date': Heart,
  'groceries': ShoppingBasket,
  'transport': BusFront,
  'school': School,
};

interface ExpenseTrackerProps {
  transactions: TransactionHistory[];
  wallets: WalletSummary[]
  historicalSnapshots?: WalletSnapshot[];
}

export default function ExpenseTrackerPage({
  wallets,
  transactions,
  historicalSnapshots
}: ExpenseTrackerProps) {

  return (
    <PageComponent>

       <pre className="bg-muted p-4 rounded text-xs overflow-auto max-h-96">
        {JSON.stringify(transactions, null, 2)}
       </pre>

      <SummaryExpense
        wallets={wallets}
        historicalSnapshots={historicalSnapshots}
        transactions={transactions}
      />

      <WalletCarousel wallets={wallets} />

      {/* MAIN CONTENT GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">

        {/* CATEGORIES SECTION */}
        <CategorySection transactions={transactions} />

        <RecentLogsSection transactions={transactions} />

      </div>
    </PageComponent>
  )
}