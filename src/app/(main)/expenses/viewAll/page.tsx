'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';

import { ArrowLeft, Filter, Bus } from 'lucide-react';
import PageComponent from '@/components/shared/PageComponent';

import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

const LOG_FILTERS = [
  { name: 'Day', value: 'day' },
  { name: 'Week', value: 'week' },
  { name: 'Month', value: 'month' },
  { name: 'Year', value: 'year' },
];

// Format currency standardizer
const formatCurrency = (amount: number, currencyCode: string = 'USD') => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currencyCode,
  }).format(amount);
};

const transactions = [
  {
    id: 1,
    date: '2026-06-11T14:00:00Z',
    icon: Bus,
    name: 'Transport #1 : 100 Market St, San Francisco',
    category: 'TRANSPORT',
    amount: 105,
  },
  {
    id: 2,
    date: '2026-06-11T09:00:00Z',
    icon: Bus,
    name: 'Transport #2 : 200 Market St, San Francisco',
    category: 'TRANSPORT',
    amount: 65,
  },
  {
    id: 3,
    date: '2026-06-10T11:30:00Z',
    icon: Bus,
    name: 'Transport #3 : 300 Market St, San Francisco',
    category: 'TRANSPORT',
    amount: 80,
  },
  {
    id: 4,
    date: '2026-05-20T16:45:00Z',
    icon: Bus,
    name: 'Transport #4 : Oakland',
    category: 'TRANSPORT',
    amount: 120,
  },
];

function getWeekKey(date: Date) {
  const start = new Date(date);
  start.setDate(date.getDate() - date.getDay());

  return `Week of ${start.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  })}`;
}

export default function TransactionsPage() {
  const [selectedFilter, setSelectedFilter] = useState('day');

  const groupedTransactions = useMemo(() => {
    const groups: Record<string, typeof transactions> = {};

    transactions.forEach((transaction) => {
      const date = new Date(transaction.date);

      let key = '';

      switch (selectedFilter) {
        case 'day':
          key = date.toLocaleDateString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric',
          });
          break;

        case 'week':
          key = getWeekKey(date);
          break;

        case 'month':
          key = date.toLocaleDateString('en-US', {
            month: 'long',
            year: 'numeric',
          });
          break;

        case 'year':
          key = date.getFullYear().toString();
          break;

        default:
          key = transaction.date;
      }

      if (!groups[key]) {
        groups[key] = [];
      }

      groups[key].push(transaction);
    });

    return Object.entries(groups).map(([label, transactions]) => ({
      label,
      total: transactions.reduce(
        (sum, transaction) => sum + transaction.amount,
        0
      ),
      transactions,
    }));
  }, [selectedFilter]);

  return (
    <PageComponent>
      <section className='mt-5'>
        {/* HEADER */}
        <header className="flex flex-col md:flex-row md:items-end justify-between items-start gap-6 mb-12">
          <div className="flex flex-col gap-2">
            <Link href="/expenses" className="mb-2">
              <Button variant="ghost" size="sm" className="h-8 px-2 text-muted-foreground hover:text-foreground">
                <ArrowLeft size={14} className="mr-2" />
                Back to Expenses
              </Button>
            </Link>
            <h1 className="text-3xl font-light tracking-tight">
              All Transactions
            </h1>
          </div>

          <nav aria-label="Time period filter">
            <Tabs
              value={selectedFilter}
              onValueChange={setSelectedFilter}
              className="w-fit"
            >
              <TabsList>
                <Filter size={14} className="ml-2 mr-2 text-muted-foreground opacity-50"/>
                {LOG_FILTERS.map((filter) => (
                  <TabsTrigger
                    key={filter.value}
                    value={filter.value}
                    className="text-xs uppercase tracking-wider"
                  >
                    {filter.name}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </nav>
        </header>

        {/* ACCORDION TABLES */}
        <section className="mt-6" aria-label="Transaction History">
          <Accordion
            type="single"
            collapsible
            defaultValue={groupedTransactions[0]?.label} // Auto-open the first one
            className="space-y-4"
          >
            {groupedTransactions.map((group) => (
              <AccordionItem
                key={group.label}
                value={group.label}
                className="border border-dashed bg-card/30 rounded-xl px-2 overflow-hidden"
              >
                <AccordionTrigger className="hover:no-underline px-4 py-5 group transition-colors">
                  <div className="flex w-full items-center justify-between pr-4">
                    <span className="text-sm font-semibold uppercase tracking-widest text-muted-foreground group-hover:text-foreground transition-colors">
                      {group.label}
                    </span>

                    <span className="font-semibold tabular-nums text-foreground/90">
                      {formatCurrency(group.total)}
                    </span>
                  </div>
                </AccordionTrigger>

                <AccordionContent className="pb-4 px-1">
                  <div className="rounded-md border border-border/50 bg-background/50 overflow-hidden">
                    <Table>
                      <TableHeader className="bg-muted/30">
                        <TableRow className="hover:bg-transparent">
                          <TableHead className="w-[50px]"></TableHead>
                          <TableHead className="text-[10px] uppercase tracking-widest font-semibold">Description</TableHead>
                          <TableHead className="text-[10px] uppercase tracking-widest font-semibold">Category</TableHead>
                          <TableHead className="text-[10px] uppercase tracking-widest font-semibold">Date</TableHead>
                          <TableHead className="text-[10px] uppercase tracking-widest font-semibold text-right">Amount</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {group.transactions.map((transaction) => {
                          const Icon = transaction.icon;
                          const dateObj = new Date(transaction.date);

                          return (
                            <TableRow key={transaction.id} className="group/row border-b-border/50 transition-colors hover:bg-secondary/20">
                              <TableCell>
                                <div className="bg-secondary/60 text-muted-foreground group-hover/row:bg-background group-hover/row:shadow-sm group-hover/row:text-foreground p-2 rounded-full flex items-center justify-center shrink-0 transition-all duration-300 w-8 h-8">
                                  <Icon size={14} />
                                </div>
                              </TableCell>
                              <TableCell className="font-medium text-sm text-foreground/90">
                                {transaction.name}
                              </TableCell>
                              <TableCell className="text-xs uppercase tracking-wider text-muted-foreground">
                                {transaction.category}
                              </TableCell>
                              <TableCell className="text-xs font-mono text-muted-foreground">
                                {dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                              </TableCell>
                              <TableCell className="text-right tabular-nums font-medium text-foreground/90">
                                {formatCurrency(transaction.amount)}
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </section>
      </section>

    </PageComponent>
  );
}