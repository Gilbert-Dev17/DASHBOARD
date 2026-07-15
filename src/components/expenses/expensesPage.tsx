'use client'

import React from 'react'

import { ArrowDownLeft, ArrowUpRight, DrumstickIcon, ShoppingBag, Tv, Heart, ShoppingBasket, BusFront, School, HelpCircle, Wallet as WalletIcon, CreditCard, TrendingUp, TrendingDown } from 'lucide-react'

import PageComponent from '@/components/shared/PageComponent'
import { FinancialSummary, CategorySummary, Transaction } from '@/types/expenses'
import { formatCurrency } from '@/utils/currency'
import { summary as mockSummary, categories as mockCategories, recentTransactions as mockTransactions, mockWallets } from '@/lib/mockData'
import { WalletCarousel } from './accounts-Carousel'
import { SummaryExpense } from './summary-expense'
import { CategorySection } from './category-section'
import { RecentLogsSection } from './recent-Logs'

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
  initialFilter?: 'week' | 'month' | 'year';
  summary?: FinancialSummary & { trend?: number };
  categories?: CategorySummary[];
  transactions?: Transaction[];
}

export default function ExpenseTrackerPage({
  initialFilter = 'week',
  summary = mockSummary,
  categories = mockCategories,
  transactions = mockTransactions
}: ExpenseTrackerProps) {

  const formattedBalance = formatCurrency(summary.balance, summary.currency);
  const [balanceMain, balanceCents] = formattedBalance.split('.');

  const formattedIncome = formatCurrency(summary.income, summary.currency);
  const [incomeMain, incomeCents] = formattedIncome.split('.');

  const formattedExpense = formatCurrency(summary.expense, summary.currency);
  const [expenseMain, expenseCents] = formattedExpense.split('.');

  return (
    <PageComponent>

      {/* SUMMARY SECTION */}
      <SummaryExpense
        summary={summary}
        balanceMain={balanceMain}
        balanceCents={balanceCents}
        incomeMain={incomeMain}
        incomeCents={incomeCents}
        expenseMain={expenseMain}
        expenseCents={expenseCents}
      />

      {/* WALLETS CAROUSEL */}
      <WalletCarousel wallets={summary} />

      {/* MAIN CONTENT GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">

        {/* CATEGORIES SECTION */}
        <CategorySection categories={categories} />

            {/* RECENT LOGS SECTION */}
            <RecentLogsSection transactions={transactions} />

        </div>
    </PageComponent>
  )
}