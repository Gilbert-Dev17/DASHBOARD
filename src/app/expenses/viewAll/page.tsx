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

const LOG_FILTERS = [
  { name: 'Day', value: 'day' },
  { name: 'Week', value: 'week' },
  { name: 'Month', value: 'month' },
  { name: 'Year', value: 'year' },
];

const transactions = [
  {
    id: 1,
    date: '2026-06-11',
    icon: Bus,
    name: 'Transport #1 : 100 Market St, San Francisco',
    category: 'TRANSPORT',
    amount: 105,
  },
  {
    id: 2,
    date: '2026-06-11',
    icon: Bus,
    name: 'Transport #2 : 200 Market St, San Francisco',
    category: 'TRANSPORT',
    amount: 65,
  },
  {
    id: 3,
    date: '2026-06-10',
    icon: Bus,
    name: 'Transport #3 : 300 Market St, San Francisco',
    category: 'TRANSPORT',
    amount: 80,
  },
  {
    id: 4,
    date: '2026-05-20',
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
    <PageComponent >
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <Link href="/expenses">
            <Button variant="ghost" size="icon">
              <ArrowLeft size={16} className="opacity-50" />
            </Button>
          </Link>

          <h1 className="text-3xl font-semibold tracking-tight">
            All Transactions
          </h1>
        </div>

        <Tabs
          value={selectedFilter}
          onValueChange={setSelectedFilter}
          className="w-fit"
        >
          <TabsList>
            <Filter size={16} />

            {LOG_FILTERS.map((filter) => (
              <TabsTrigger
                key={filter.value}
                value={filter.value}
              >
                {filter.name}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      <section className="mt-6">
        <Accordion
          type="single"
          collapsible
          className="space-y-2"
        >
          {groupedTransactions.map((group) => (
            <AccordionItem
              key={group.label}
              value={group.label}
            >
              <AccordionTrigger className="hover:no-underline">
                <div className="flex w-full items-center justify-between pr-4">
                  <span className="font-medium">
                    {group.label}
                  </span>

                  <span className="opacity-60 tabular-nums">
                    ${group.total.toFixed(2)}
                  </span>
                </div>
              </AccordionTrigger>

              <AccordionContent className="space-y-2">
                {group.transactions.map((transaction) => {
                  const Icon = transaction.icon;

                  return (
                    <div
                      key={transaction.id}
                      className="flex justify-between rounded-md border px-4 py-3 text-sm"
                    >
                      <div className="flex items-center gap-5">
                        <Icon size={16} />

                        <p className="font-medium">
                          {transaction.name}
                        </p>
                      </div>

                      <div className="flex items-center gap-5">
                        <p className="font-medium">
                          {transaction.category}
                        </p>

                        <p className="font-medium">
                          ${transaction.amount.toFixed(2)}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </section>
    </PageComponent>
  );
}