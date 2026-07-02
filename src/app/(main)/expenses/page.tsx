'use client'

import React, { useState } from 'react'
import Link from 'next/link'

import { ArrowDownLeft, ArrowUpRight, DrumstickIcon, ShoppingBag, Tv, Heart, ShoppingBasket, BusFront, School, HelpCircle } from 'lucide-react'

import { HeaderTitle } from '@/components/shared/HeaderTitle'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import PageComponent from '@/components/shared/PageComponent'
import { ChartPieDonutText } from '@/components/shared/CategoryCharts'
import { AddCategoryModal } from '@/components/modals/add-category/AddCategoryModal'
import { FinancialSummary, CategorySummary, Transaction } from '@/types/expenses'

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

// Format currency standardizer
const formatCurrency = (amount: number, currencyCode: string = 'USD') => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currencyCode,
  }).format(amount);
};

// ============================================================================
// 3. COMPONENT PROPS
// ============================================================================

interface ExpenseTrackerProps {
  initialFilter?: 'week' | 'month' | 'year';
  summary?: FinancialSummary;
  categories?: CategorySummary[];
  transactions?: Transaction[];
}

// ============================================================================
// 4. MAIN COMPONENT
// ============================================================================

export default function ExpenseTrackerPage({
  initialFilter = 'week',
  summary = {
    balance: 150250.75,
    income: 150250.75,
    expense: 150250.75,
    currency: 'USD'
  },
  categories = [
    { name: 'Foods & Drinks', total: 1000, iconKey: 'foods-drinks' },
    { name: 'Shopping', total: 1000, iconKey: 'shopping' },
    { name: 'Transport', total: 900, iconKey: 'transport' },
  ],
  transactions = [
    { date: '2026-06-11T14:00:00Z', note: 'Transport #1', amount: 65.00, type: 'expense', category: 'Transport', currency: 'PHP' },
    { date: '2026-06-10T09:30:00Z', note: 'Common Ground ; choco drink + ramen', amount: 250.00, type: 'expense', category: 'Food & Drinks', currency: 'PHP' },
  ]
}: ExpenseTrackerProps) {

  const [expenseFilter, setExpenseFilter] = useState<string>(initialFilter);

  const expenseFilters = [
    { name: 'This Week', value: 'week' },
    { name: 'This Month', value: 'month' },
    { name: 'This Year', value: 'year' },
  ];

  const filterLabel = expenseFilters.find((f) => f.value === expenseFilter)?.name ?? '';

  // Handler for when the user changes the time period
  const handleFilterChange = (value: string) => {
    setExpenseFilter(value);
    // TODO: In a real app, this should trigger a data refetch
    // e.g., router.push(`?filter=${value}`) or a data fetching function
  };

  // Pre-split the balance for the stylized UI requirement
  const formattedBalance = formatCurrency(summary.balance, summary.currency);
  const [balanceMain, balanceCents] = formattedBalance.split('.');

  const formattedIncome = formatCurrency(summary.income, summary.currency);
  const [incomeMain, incomeCents] = formattedIncome.split('.');

  const formattedExpense = formatCurrency(summary.expense, summary.currency);
  const [expenseMain, expenseCents] = formattedExpense.split('.');

  return (
    <PageComponent>
      {/* HEADER & FILTER ROW */}
      <header className="flex flex-col md:flex-row md:items-end justify-between items-center gap-6 mb-12">
        <HeaderTitle
          title="Expense Tracker"
          desc="Manage your categories and spendings."
        />
        <nav aria-label="Time period filter">
          <Tabs value={expenseFilter} onValueChange={handleFilterChange} className="w-fit">
            <TabsList>
              {expenseFilters.map((filter) => (
                <TabsTrigger key={filter.value} value={filter.value}>
                  {filter.name}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </nav>
      </header>

      {/* SUMMARY CARDS */}
      <section aria-label="Financial Summary" className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-semibold">Total Balance</CardTitle>
          </CardHeader>
          <CardContent className="text-3xl lg:text-[2.5rem] leading-none font-light tracking-tight">
            {balanceMain}<span className="text-xl lg:text-2xl">.{balanceCents}</span>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden">
          <CardHeader>
            <CardTitle className="text-sm font-semibold">
              Income <span className="text-muted-foreground font-normal">({filterLabel})</span>
            </CardTitle>
            <div className="absolute top-0 right-0 w-12 h-12 flex items-center justify-center rounded-bl-[1rem] bg-emerald-500 text-white" aria-hidden="true">
              <ArrowDownLeft size={20} />
            </div>
          </CardHeader>
          <CardContent className="text-3xl lg:text-[2.5rem] leading-none font-light tracking-tight text-emerald-500">
            +{incomeMain}<span className="text-xl lg:text-2xl">.{incomeCents}</span>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden">
          <CardHeader>
            <CardTitle className="text-sm font-semibold">
              Expense <span className="text-muted-foreground font-normal">({filterLabel})</span>
            </CardTitle>
            <div className="absolute top-0 right-0 w-12 h-12 flex items-center justify-center rounded-bl-[1rem] bg-rose-500 text-white" aria-hidden="true">
              <ArrowUpRight size={20} />
            </div>
          </CardHeader>
          <CardContent className="text-3xl lg:text-[2.5rem] leading-none font-light tracking-tight text-rose-500">
            -{expenseMain}<span className="text-xl lg:text-2xl">.{expenseCents}</span>
          </CardContent>
        </Card>
      </section>

      {/* MAIN CONTENT GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 md:grid-cols-3 gap-12 lg:gap-24">

        {/* CATEGORIES SECTION */}
        <section className="lg:col-span-7" aria-labelledby="categories-heading">
          <header className="flex flex-row justify-between items-center border-b border-border pb-4 mb-2">
            <h2 id="categories-heading" className="text-sm font-semibold">Categories</h2>
            <AddCategoryModal />
          </header>

          <div aria-hidden="true">
            {/* Assuming ChartPieDonutText accepts the new CategorySummary interface */}
            <ChartPieDonutText categories={categories} />
          </div>

          <div className="grid grid-cols-2 gap-x-5 mt-6" role="list">
            {categories.map((category) => {
              const IconComponent = ICON_MAP[category.iconKey] || HelpCircle;

              return (
                <article
                  key={category.name}
                  role="listitem"
                  className="flex flex-row justify-between items-center px-2 py-3 rounded-lg hover:bg-secondary/50 transition-colors"
                >
                  <div className="flex flex-row items-center gap-3">
                    <div className="bg-secondary p-2 rounded-full flex items-center justify-center shrink-0">
                      <IconComponent size={18} aria-hidden="true" />
                    </div>
                    <span className="font-medium cursor-pointer">{category.name}</span>
                  </div>
                  <span className="font-medium tabular-nums">
                    {formatCurrency(category.total, summary.currency)}
                  </span>
                </article>
              )
            })}
          </div>
        </section>

        {/* RECENT LOGS SECTION */}
        <section className="lg:col-span-5" aria-labelledby="logs-heading">
          <header className="flex flex-row justify-between items-center border-b border-border pb-4 mb-6">
            <h2 id="logs-heading" className="text-sm font-semibold">Recent Logs</h2>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/expenses/viewAll">View All</Link>
            </Button>
          </header>

          {transactions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-muted-foreground text-sm">
              No recent logs yet.
            </div>
          ) : (
            <div className="space-y-6" role="list">
              {transactions.map((txn) => {
                const dateObj = new Date(txn.date);

                return (
                  <article key={txn.date} role="listitem" className="border-l-2 pl-4 relative border-border">
                    <div className="absolute w-2 h-2 rounded-full -left-1.25 top-1 transition-colors duration-500 bg-accent" aria-hidden="true"></div>

                    <time dateTime={txn.date} className="text-xs mb-1 text-muted-foreground block transition-colors duration-500">
                      {dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </time>

                    <div className="flex justify-between items-start text-sm mb-1">
                      <span className="font-medium">{txn.note}</span>
                      <span className={`tabular-nums font-medium transition-colors duration-500 ${txn.type === 'income' ? 'text-emerald-500' : ''}`}>
                        {txn.type === 'income' ? '+' : '-'}
                        {/* Using standard formatCurrency here based on the transaction's specific currency */}
                        {formatCurrency(txn.amount, txn.currency)}
                      </span>
                    </div>
                  </article>
                )
              })}
            </div>
          )}
        </section>
      </div>
    </PageComponent>
  )
}