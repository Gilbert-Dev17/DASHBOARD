'use client'

import React, { useState } from 'react'
import Link from 'next/link'

import { ArrowDownLeft, ArrowUpRight, Plus } from 'lucide-react'
import { DrumstickIcon, ShoppingBag, Tv, Heart, ShoppingBasket, BusFront, School } from 'lucide-react'

import { HeaderTitle } from '@/components/shared/HeaderTitle'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import PageComponent from '@/components/shared/PageComponent';
import { ChartPieDonutText } from '@/components/shared/CategoryCharts'
import { AddCategoryModal } from '@/components/shared/AddCategoryModal'


const Page = () => {
  const [expenseFilter, setExpenseFilter] = useState<string | undefined >('week')

  const expenseFilters = [
    { name: 'This Week', value: 'week' },
    { name: 'This Month', value: 'month' },
    { name: 'This Year', value: 'year' },
  ]

  const expenseCategories = [
    { icon: DrumstickIcon, name: 'Foods & Drinks', total: '1,000' },
    { icon: ShoppingBag, name: 'Shopping', total: '1000' },
    { icon: Tv, name: 'Entertainment', total: '500' },
    { icon: Heart, name: 'Date', total: '100' },
    { icon: ShoppingBasket, name: 'Groceries', total: '100' },
    { icon: BusFront, name: 'Transport', total: '900' },
    { icon: School, name: 'School', total: '100' },
  ]

   const transactions = [
    { id: 1, date: new Date('2026-06-11T14:00:00'), note: 'Transport #1', amount: 65.00, type: 'expense', category: 'Transport', currency: '₱' },
    { id: 2, date: new Date('2026-06-11T14:30:00'), note: 'Transport #2', amount: 105.00, type: 'expense', category: 'Transport', currency: '₱' },
    { id: 3, date: new Date('2026-06-10T09:30:00'), note: 'Common Ground ; choco drink + ramen', amount: 250.00, type: 'expense', category: 'Food & Drinks', currency: '₱' },
    { id: 4, date: new Date('2026-06-10T12:15:00'), note: 'Print', amount: 45.00, type: 'expense', category: 'School', currency: '₱' },
    { id: 5, date: new Date('2026-06-08T12:15:00'), note: 'jabee chicken', amount: 100.00, type: 'expense', category: 'Food & Drinks', currency: '₱' },
    { id: 6, date: new Date('2026-06-08T15:00:00'), note: 'grad pic', amount: 1500.00, type: 'expense', category: 'School', currency: '₱' }
  ];

  // Fix: resolve full label from filter value instead of interpolating raw value
  const filterLabel = expenseFilters.find((f) => f.value === expenseFilter)?.name ?? ''

  return (
    <PageComponent>
      {/* Header & Filter Row */}
      <div className="flex flex-col md:flex-row md:items-end justify-between items-center gap-6 mb-12">
        <HeaderTitle
          title="Expense Tracker"
          desc="Manage your categories and spendings."
        />
        <Tabs value={expenseFilter} onValueChange={setExpenseFilter} className="w-fit">
          <TabsList>
            {expenseFilters.map((filter) => (
              <TabsTrigger key={filter.value} value={filter.value}>
                {filter.name}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-semibold">Total Balance</CardTitle>
          </CardHeader>
          <CardContent className="text-3xl lg:text-[2.5rem] leading-none font-light tracking-tight">
            $150,250<span className="text-xl lg:text-2xl">.75</span>
          </CardContent>
        </Card>

        {/* Fix: overflow-hidden so corner badge doesn't bleed; green for income */}
        <Card className="relative overflow-hidden">
          <CardHeader>
            <CardTitle className="text-sm font-semibold">
              Income{' '}
              <span className="text-muted-foreground font-normal">({filterLabel})</span>
            </CardTitle>
            <div className="absolute top-0 right-0 w-12 h-12 flex items-center justify-center rounded-bl-[1rem] bg-emerald-500 text-white">
              <ArrowDownLeft size={20} />
            </div>
          </CardHeader>
          <CardContent className="text-3xl lg:text-[2.5rem] leading-none font-light tracking-tight text-emerald-500">
            +$150,250<span className="text-xl lg:text-2xl">.75</span>
          </CardContent>
        </Card>

        {/* Fix: overflow-hidden so corner badge doesn't bleed; red for expense */}
        <Card className="relative overflow-hidden">
          <CardHeader>
            <CardTitle className="text-sm font-semibold">
              Expense{' '}
              <span className="text-muted-foreground font-normal">({filterLabel})</span>
            </CardTitle>
            <div className="absolute top-0 right-0 w-12 h-12 flex items-center justify-center rounded-bl-[1rem] bg-rose-500 text-white">
              <ArrowUpRight size={20} />
            </div>
          </CardHeader>
          <CardContent className="text-3xl lg:text-[2.5rem] leading-none font-light tracking-tight text-rose-500">
            -$150,250<span className="text-xl lg:text-2xl">.75</span>
          </CardContent>
        </Card>
      </div>

      {/* Fix: responsive grid + div instead of multiple <main> tags */}
      <section className="grid grid-cols-1 lg:grid-cols-12 md:grid-cols-3 gap-12 lg:gap-24">

        {/* Categories */}
        <div className="lg:col-span-7">
          {/* Fix: items-center on header row */}
          <div className="flex flex-row justify-between items-center border-b border-border pb-4 mb-2">
            <Label className="text-sm font-semibold">Categories</Label>
            <AddCategoryModal/>
          </div>

          <div>
            <ChartPieDonutText categories={expenseCategories} />
          </div>

          <div className="grid grid-cols-2 gap-x-5">
            {expenseCategories.map((category) => (
              <div
                key={category.name}
                className="flex flex-row justify-between items-center px-2 py-3 rounded-lg hover:bg-secondary/50 transition-colors"
              >
                <div className="flex flex-row items-center gap-3">
                  <div className="bg-secondary p-2 rounded-full flex items-center justify-center shrink-0">
                    <category.icon size={18} />
                  </div>
                  <Label className="cursor-pointer">{category.name}</Label>
                </div>
                <Label className="font-medium tabular-nums">${category.total}</Label>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Logs */}
        <div className="lg:col-span-5">
          {/* Fix: items-center on header row */}
          <div className="flex flex-row justify-between items-center border-b border-border pb-4 mb-2">
            <Label className="text-sm font-semibold">Recent Logs</Label>
            <Link href='/expenses/viewAll'>
              <Button variant="ghost" size="sm">
                View All
              </Button>
            </Link>
          </div>

          {/* Empty state placeholder */}
          {/* <div className="flex flex-col items-center justify-center py-16 text-muted-foreground text-sm">
            No recent logs yet.
          </div> */}

          <div className="space-y-6">
            {transactions.map((txn) => {
              // const isFirst = i === 0;
              return (
                <div key={txn.id} className="border-l-2 pl-4 relative" >
                  <div className="absolute w-2 h-2 rounded-full -left-1.25 top-1 transition-colors duration-500 bg-accent"></div>
                  <p className={`text-xs mb-1 transition-colors duration-500`} >
                    {txn.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </p>
                  <div className="flex justify-between items-start text-sm mb-1">
                    <span className="font-medium">{txn.note}</span>
                    <span className={`tabular-nums font-medium transition-colors duration-500`}>
                      {txn.type === 'income' ? '+' : '-'}{txn.currency}{txn.amount.toFixed(2)}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>
    </PageComponent>
  )
}

export default Page