'use client';

import { useMemo, useState, useEffect } from 'react';
import Link from 'next/link';

import { ArrowLeft, Filter, CreditCard } from 'lucide-react';
import PageComponent from '@/components/shared/PageComponent';
import { HeaderTitle } from '@/components/shared/HeaderTitle';
import { Button } from '@/components/ui/button';
import { formatCurrency, getSignedAmount, formatSignedCurrency } from '@/utils/currency';
import { TransactionHistory } from '@/types/expenses';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Accordion, AccordionContent, AccordionItem, AccordionTrigger,
} from '@/components/ui/accordion';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table"
import {
  Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious,
} from "@/components/ui/pagination"

const LOG_FILTERS = [
  { name: 'Day', value: 'day' },
  { name: 'Week', value: 'week' },
  { name: 'Month', value: 'month' },
  { name: 'Year', value: 'year' },
];

function getWeekKey(date: Date) {
  const start = new Date(date);
  start.setDate(date.getDate() - date.getDay());

  return `Week of ${start.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  })}`;
}

import { useRouter } from 'next/navigation';
import { CurrencySwitcher } from '@/components/shared/CurrencySwitcher';
import { WalletSummary, UserSummary } from '@/types/dashboard';
import { useCurrencyFilter } from '@/hooks/useCurrencyFilter';

interface ViewAllTransactionsProps {
  transactions: TransactionHistory[];
  wallets: WalletSummary[];
  user?: UserSummary;
}

export function ViewAllTransactions({ transactions, wallets, user }: ViewAllTransactionsProps) {
  const router = useRouter();
  const [selectedFilter, setSelectedFilter] = useState('day');
  const [page, setPage] = useState(1);
  const itemsPerPage = 30;

  const { availableCurrencies, activeCurrency, setActiveCurrency, filteredTransactions } = useCurrencyFilter({ wallets, user, transactions });

  useEffect(() => {
    setPage(1);
  }, [selectedFilter, activeCurrency]);

  const groupedTransactions = useMemo(() => {
    const groups: Record<string, TransactionHistory[]> = {};

    filteredTransactions.forEach((transaction) => {
      const date = new Date(transaction.created_for_date || transaction.created_at);

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
          key = date.toLocaleDateString('en-US', {
            year: 'numeric',
          });
          break;

        default:
          key = String(transaction.created_for_date || transaction.created_at);
      }

      if (!groups[key]) {
        groups[key] = [];
      }

      groups[key].push(transaction);
    });

    return Object.entries(groups).map(([label, transactions]) => ({
      label,
      total: transactions.reduce(
        (sum, transaction) => sum + getSignedAmount({
          amount: Number(transaction.amount),
          transaction_type: transaction.type,
          wallet_id: transaction.wallet_id,
          to_wallet_id: (transaction as any).to_wallet_id || null
        }, transaction.wallet_id),
        0
      ),
      transactions,
    }));
  }, [selectedFilter, activeCurrency]);

  const totalPages = Math.ceil(groupedTransactions.length / itemsPerPage);
  const paginatedGroups = groupedTransactions.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  return (
    <PageComponent>
      <section className='mt-5'>
        {/* HEADER */}
        <header className="flex flex-col md:flex-row md:items-end justify-between items-start gap-6 mb-12">
          <div className="flex flex-col gap-2">
            <Button 
              variant="ghost" 
              size="sm" 
              className="group h-8 px-2 text-muted-foreground hover:text-foreground mb-2 w-fit"
              onClick={() => router.back()}
            >
              <ArrowLeft size={14} className="mr-2 transition-transform duration-300 group-hover:-translate-x-1" />
              Back
            </Button>
            <HeaderTitle title="All Transactions" desc="View and filter all your past logs and transactions." />
          </div>

          <nav aria-label="Time period filter" className="flex flex-col sm:flex-row items-center gap-4">
            <CurrencySwitcher 
              currencies={availableCurrencies} 
              activeCurrency={activeCurrency} 
              onCurrencyChange={setActiveCurrency} 
            />
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
          {transactions.length === 0 ? (
            <div className="w-full flex flex-col items-center justify-center py-24 border border-dashed rounded-xl bg-card/30">
              <CreditCard className="h-10 w-10 text-muted-foreground/30 mb-4" />
              <p className="text-base font-medium text-foreground/80 mb-1">No transactions found</p>
              <p className="text-sm text-muted-foreground">You haven't logged any expenses or income yet.</p>
            </div>
          ) : (
            <>
              <Accordion
                type="single"
                collapsible
                defaultValue={paginatedGroups[0]?.label}
                className="space-y-4"
              >
                {paginatedGroups.map((group) => (
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

                        <span className={`font-semibold tabular-nums ${group.total > 0 ? 'text-emerald-500' : group.total < 0 ? 'text-rose-500' : 'text-foreground/90'}`}>
                          {formatSignedCurrency(group.total, activeCurrency, true)}
                        </span>
                      </div>
                    </AccordionTrigger>

                    <AccordionContent className="pb-4 px-1">
                      <div className="rounded-md border border-border/50 bg-background/50 overflow-hidden">
                        <Table>
                          <TableHeader className="bg-muted/30">
                            <TableRow className="hover:bg-transparent">
                              <TableHead className="w-12.5"></TableHead>
                              <TableHead className="text-[10px] uppercase tracking-widest font-semibold">Description</TableHead>
                              <TableHead className="text-[10px] uppercase tracking-widest font-semibold">Category</TableHead>
                              <TableHead className="text-[10px] uppercase tracking-widest font-semibold">Type</TableHead>
                              <TableHead className="text-[10px] uppercase tracking-widest font-semibold">Date</TableHead>
                              <TableHead className="text-[10px] uppercase tracking-widest font-semibold text-right">Amount</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {group.transactions.map((transaction) => {
                              const dateObj = new Date(transaction.created_for_date || transaction.created_at);
                              
                              const signedAmount = getSignedAmount({
                                amount: Number(transaction.amount),
                                transaction_type: transaction.type,
                                wallet_id: transaction.wallet_id,
                                to_wallet_id: (transaction as any).to_wallet_id || null
                              }, transaction.wallet_id);
                              
                              const isPositive = signedAmount > 0;
                              const isTransfer = transaction.type === 'transfer';
                              const colorClass = isTransfer ? 'text-muted-foreground' : isPositive ? 'text-emerald-500' : 'text-rose-500';

                              return (
                                <TableRow key={transaction.id} className="group/row border-b-border/50 transition-colors hover:bg-secondary/20">
                                  <TableCell>
                                    <div className="bg-secondary/60 text-muted-foreground group-hover/row:bg-background group-hover/row:shadow-sm group-hover/row:text-foreground p-2 rounded-full flex items-center justify-center shrink-0 transition-all duration-300 w-8 h-8">
                                      <CreditCard size={14} />
                                    </div>
                                  </TableCell>
                                  <TableCell className="font-medium text-sm text-foreground/90">
                                    {transaction.title}
                                  </TableCell>
                                  <TableCell className="text-xs uppercase tracking-wider text-muted-foreground">
                                    {transaction.expense_categories?.name}
                                  </TableCell>
                                  <TableCell className="text-xs uppercase tracking-wider text-muted-foreground">
                                    {transaction.type}
                                  </TableCell>
                                  <TableCell className="text-xs font-mono text-muted-foreground">
                                    {dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                  </TableCell>
                                  <TableCell className={`text-right tabular-nums font-medium ${colorClass}`}>
                                    {formatSignedCurrency(signedAmount, activeCurrency, !isTransfer)}
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

              {totalPages > 1 && (
                <div className="mt-8">
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious
                          href="#"
                          onClick={(e) => {
                            e.preventDefault();
                            setPage((p) => Math.max(1, p - 1));
                          }}
                          className={page === 1 ? "pointer-events-none opacity-50" : ""}
                        />
                      </PaginationItem>

                      <PaginationItem>
                        <span className="text-sm text-muted-foreground px-4">
                          Page {page} of {totalPages}
                        </span>
                      </PaginationItem>

                      <PaginationItem>
                        <PaginationNext
                          href="#"
                          onClick={(e) => {
                            e.preventDefault();
                            setPage((p) => Math.min(totalPages, p + 1));
                          }}
                          className={page === totalPages ? "pointer-events-none opacity-50" : ""}
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </div>
              )}
            </>
          )}
        </section>
      </section>

    </PageComponent>
  );
}
