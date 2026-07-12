'use client'

import React, { useState } from 'react'
import Link from 'next/link'

import { ArrowDownLeft, ArrowUpRight, DrumstickIcon, ShoppingBag, Tv, Heart, ShoppingBasket, BusFront, School, HelpCircle, Wallet as WalletIcon, CreditCard, TrendingUp, TrendingDown } from 'lucide-react'

import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import PageComponent from '@/components/shared/PageComponent'
import { ChartPieDonutText } from '@/components/shared/CategoryCharts'
import { AddCategoryModal } from '@/components/modals/add-category/AddCategoryModal'
import { FinancialSummary, CategorySummary, Transaction } from '@/types/expenses'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"
import { Separator } from '@/components/ui/separator'

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

interface ExpenseTrackerProps {
  initialFilter?: 'week' | 'month' | 'year';
  summary?: FinancialSummary & { trend?: number };
  categories?: CategorySummary[];
  transactions?: Transaction[];
}

export default function ExpenseTrackerPage({
  initialFilter = 'week',
  summary = {
    balance: 150250.75, // Net Worth
    income: 850.00,
    expense: 200.00,
    currency: 'USD',
    trend: 5.2
  },
  categories = [
    { name: 'Groceries', total: 120, iconKey: 'groceries' },
    { name: 'Transport', total: 65, iconKey: 'transport' },
    { name: 'Foods & Drinks', total: 15, iconKey: 'foods-drinks' },
  ],
  transactions = [
    { date: '2026-06-11T14:00:00Z', note: 'Uber to Downtown', amount: 65.00, type: 'expense', category: 'Transport', currency: 'USD' },
    { date: '2026-06-10T09:30:00Z', note: 'Common Ground Coffee', amount: 15.00, type: 'expense', category: 'Foods & Drinks', currency: 'USD' },
    { date: '2026-06-09T18:00:00Z', note: 'Freelance Design Work', amount: 850.00, type: 'income', category: 'Income', currency: 'USD' },
    { date: '2026-06-08T12:00:00Z', note: 'Trader Joes Groceries', amount: 120.00, type: 'expense', category: 'Groceries', currency: 'USD' },
  ]
}: ExpenseTrackerProps) {

  const formattedBalance = formatCurrency(summary.balance, summary.currency);
  const [balanceMain, balanceCents] = formattedBalance.split('.');

  const formattedIncome = formatCurrency(summary.income, summary.currency);
  const [incomeMain, incomeCents] = formattedIncome.split('.');

  const formattedExpense = formatCurrency(summary.expense, summary.currency);
  const [expenseMain, expenseCents] = formattedExpense.split('.');

  // Mock Wallets Data
  const mockWallets = [
    { id: '1', name: 'Main Checking', balance: 5250.75, type: 'asset', trend: 2.1 },
    { id: '2', name: 'Emergency Fund', balance: 10000.00, type: 'asset', trend: 0.5 },
    { id: '3', name: 'Credit Card', balance: 1250.00, type: 'liability', trend: -1.5 },
    { id: '4', name: 'Vanguard Index', balance: 136250.00, type: 'asset', trend: 8.4 },
    { id: '5', name: 'Bitcoin', balance: 136250.00, type: 'asset', trend: 8.4 },

  ];

  return (
    <PageComponent>

      {/* SUMMARY SECTION */}
      <section aria-label="Financial Summary" className="flex flex-col xl:flex-row xl:items-end justify-between gap-8 xl:gap-16 mb-8 pb-12 border-b border-dashed border-border/50">
        {/* Left Side: Net Worth */}
        <div className="flex flex-col">
          <div className="flex items-center gap-4 mb-4">
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Net Worth</span>
            {summary.trend !== undefined && (
              <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-medium ${
                summary.trend >= 0 ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'
              }`}>
                {summary.trend >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                {summary.trend > 0 ? '+' : ''}{summary.trend}%
              </div>
            )}
          </div>
          <div className="text-6xl md:text-7xl lg:text-[7rem] leading-none font-light tracking-tighter tabular-nums flex items-baseline">
            {balanceMain}<span className="text-4xl md:text-5xl lg:text-6xl text-muted-foreground/40">.{balanceCents}</span>
          </div>
        </div>

        {/* Vertical Separator */}
        <Separator orientation='vertical' className="hidden xl:block w-px self-stretch bg-border/50 opacity-60" />

        {/* Right Side: Income & Expense */}
        <div className="flex flex-col sm:flex-row items-start sm:items-end gap-12 sm:gap-16 xl:pb-2 w-full">
           {/* Income */}
           <div className="flex flex-col gap-3">
             <div className="flex items-center gap-2">
               <ArrowDownLeft size={16} className="text-emerald-500" />
               <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">
                 Income
               </span>
             </div>
             <div className="text-4xl lg:text-5xl font-light text-emerald-500 tabular-nums tracking-tight flex items-baseline">
               +{incomeMain}<span className="text-lg lg:text-2xl opacity-60">.{incomeCents}</span>
             </div>
           </div>

           {/* Expense */}
           <div className="flex flex-col gap-3">
             <div className="flex items-center gap-2">
               <ArrowUpRight size={16} className="text-rose-500" />
               <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">
                 Expense
               </span>
             </div>
             <div className="text-4xl lg:text-5xl font-light text-rose-500 tabular-nums tracking-tight flex items-baseline">
               -{expenseMain}<span className="text-lg lg:text-2xl opacity-60">.{expenseCents}</span>
             </div>
           </div>
        </div>
      </section>

      {/* WALLETS CAROUSEL */}
      <section aria-label="Your Wallets" className="mb-16">
        <Carousel className="w-full" opts={{ align: "start", dragFree: true }}>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Accounts</h2>
            <div className="flex items-center gap-2">
              <CarouselPrevious className="static transform-none translate-x-0 translate-y-0" />
              <CarouselNext className="static transform-none translate-x-0 translate-y-0" />
            </div>
          </div>

          <CarouselContent className="ml-4">
            {mockWallets.map((wallet) => {
              const Icon = wallet.type === 'asset' ? WalletIcon : CreditCard;
              const isLiability = wallet.type === 'liability';

              return (
                <CarouselItem key={wallet.id} className="basis-[85%] md:basis-1/2 lg:basis-1/3 xl:basis-1/4 p-1">
                  <Card className="h-full flex flex-col justify-between hover:bg-secondary/20 transition-colors">
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                      <CardTitle className="text-sm font-medium text-foreground/80">{wallet.name}</CardTitle>
                      <Icon size={16} className={isLiability ? "text-destructive/70" : "text-muted-foreground"} />
                    </CardHeader>
                    <CardContent>
                      <div className={`text-2xl tabular-nums font-medium ${isLiability ? "text-destructive/90" : "text-foreground"}`}>
                        {isLiability ? "-" : ""}{formatCurrency(wallet.balance, summary.currency)}
                      </div>
                      <div className="flex items-center justify-between mt-2">
                        <p className="text-[10px] uppercase tracking-wider text-accent">
                          {isLiability ? "Liability" : "Asset"}
                        </p>
                        {wallet.trend !== undefined && (
                          <div className={`flex items-center gap-1 text-[10px] font-medium ${
                            wallet.trend >= 0 ? 'text-emerald-500' : 'text-rose-500'
                          }`}>
                            {wallet.trend >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                            {Math.abs(wallet.trend)}%
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </CarouselItem>
              )
            })}
          </CarouselContent>
        </Carousel>
      </section>

      {/* MAIN CONTENT GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">

        {/* CATEGORIES SECTION */}
        <section className="lg:col-span-7 flex flex-col" aria-labelledby="categories-heading">
          <header className="flex flex-row justify-between items-center pb-4 mb-2 shrink-0">
            <h2 id="categories-heading" className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Spend by Category</h2>
            <AddCategoryModal />
          </header>

          <div aria-hidden="true" className="mb-8 bg-card/30 border rounded-xl p-6">
            <ChartPieDonutText categories={categories} />
          </div>

          <div className="flex flex-col gap-3" role="list">
            {categories.map((category) => {
              const IconComponent = ICON_MAP[category.iconKey] || HelpCircle;

              return (
                <article
                  key={category.name}
                  role="listitem"
                  className="group flex flex-row justify-between items-center px-4 py-3 rounded-lg border border-transparent hover:border-border hover:bg-secondary/30 transition-all duration-300"
                >
                  <div className="flex flex-row items-center gap-4">
                    <div className="bg-secondary/60 text-foreground group-hover:bg-background group-hover:shadow-sm p-2.5 rounded-full flex items-center justify-center shrink-0 transition-all duration-300">
                      <IconComponent size={16} aria-hidden="true" />
                    </div>
                    <span className="text-sm font-medium">{category.name}</span>
                  </div>
                  <span className="font-semibold tabular-nums text-foreground/90">
                    {formatCurrency(category.total, summary.currency)}
                  </span>
                </article>
              )
            })}
          </div>
        </section>

        {/* RECENT LOGS SECTION */}
        <section className="lg:col-span-5 flex flex-col" aria-labelledby="logs-heading">
          <header className="flex flex-row justify-between items-center pb-4 mb-2 shrink-0">
            <h2 id="logs-heading" className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Recent Logs</h2>
            <Button variant="ghost" size="sm" className="text-[10px] uppercase tracking-wider h-8" asChild>
              <Link href="/expenses/viewAll">View All</Link>
            </Button>
          </header>

          <div className="flex-1 relative pb-8 pt-4">
            {/* Timeline Axis Line */}
            <div className="absolute top-0 bottom-0 left-20 w-px bg-border/50" />

            {transactions.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-muted-foreground text-sm">
                No recent logs yet.
              </div>
            ) : (
              <ol className="space-y-6 list-none m-0 p-0">
                {transactions.map((txn) => {
                  const dateObj = new Date(txn.date);

                  return (
                    <li key={txn.date} className="relative flex items-start w-full">
                      {/* Left Side: Time & Axis Dot */}
                      <div className="absolute left-0 top-3 w-20 flex items-center justify-end">
                        <time dateTime={txn.date} className="text-[10px] font-mono tabular-nums text-muted-foreground mr-4 leading-none tracking-widest uppercase">
                          {dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </time>
                        {/* Axis Dot */}
                        <div className="absolute -right-1 h-2 w-2 rounded-full bg-accent ring-4 ring-background z-10 transition-colors duration-300" />
                      </div>

                      {/* Transaction Content */}
                      <article className="pl-28 w-full group transition-all duration-300">
                        <div className="flex flex-col py-2 px-3 -ml-3 rounded-lg hover:bg-secondary/40 transition-colors">
                          <div className="flex justify-between items-start gap-4">
                            <span className="font-medium text-sm leading-tight text-foreground/90 group-hover:text-foreground">{txn.note}</span>
                            <span className={`tabular-nums font-semibold shrink-0 ${txn.type === 'income' ? 'text-emerald-500' : 'text-foreground'}`}>
                              {txn.type === 'income' ? '+' : '-'}{formatCurrency(txn.amount, txn.currency)}
                            </span>
                          </div>
                          <span className="text-[10px] uppercase tracking-wider text-muted-foreground/80 mt-1">
                            {txn.category}
                          </span>
                        </div>
                      </article>
                    </li>
                  )
                })}
              </ol>
            )}
          </div>
        </section>
      </div>
    </PageComponent>
  )
}