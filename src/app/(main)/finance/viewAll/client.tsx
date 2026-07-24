'use client';

import { useMemo, useState, useEffect } from 'react';
import Link from 'next/link';

import { ArrowLeft, Search, ArrowDown, ArrowUp, ArrowRightLeft, CreditCard } from 'lucide-react';
import PageComponent from '@/components/shared/PageComponent';
import { HeaderTitle } from '@/components/shared/HeaderTitle';
import { Button } from '@/components/ui/button';
import { formatCurrency, getSignedAmount, formatSignedCurrency } from '@/utils/currency';
import { TransactionHistory } from '@/types/expenses';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import {
  Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table"
import {
  Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious,
} from "@/components/ui/pagination"
import { useRouter } from 'next/navigation';
import { CurrencySwitcher } from '@/components/shared/CurrencySwitcher';
import { WalletSummary, UserSummary } from '@/types/dashboard';
import { useCurrencyFilter } from '@/hooks/useCurrencyFilter';
import { CategoryBadge } from '@/components/shared/CategoryBadge';

const LOG_FILTERS = [
  { name: 'All', value: 'all' },
  { name: 'Day', value: 'day' },
  { name: 'Week', value: 'week' },
  { name: 'Month', value: 'month' },
  { name: 'Year', value: 'year' },
];

function getWeekKey(date: Date) {
  const start = new Date(date);
  start.setDate(date.getDate() - date.getDay());
  return `Week of ${start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
}

function getGroupKey(date: Date, filter: string) {
  if (filter === 'week') return getWeekKey(date);
  if (filter === 'month') return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  if (filter === 'year') return date.toLocaleDateString('en-US', { year: 'numeric' });
  return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}

interface ViewAllTransactionsProps {
  transactions: TransactionHistory[];
  wallets: WalletSummary[];
  user?: UserSummary;
}

export function ViewAllTransactions({ transactions, wallets, user }: ViewAllTransactionsProps) {
  const router = useRouter();

  const [selectedFilter, setSelectedFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const [page, setPage] = useState(1);
  const itemsPerPage = 30;

  const { availableCurrencies, activeCurrency, setActiveCurrency, filteredTransactions } = useCurrencyFilter({ wallets, user, transactions });

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [selectedFilter, typeFilter, searchQuery, activeCurrency]);

  const finalTransactions = useMemo(() => {
    let result = filteredTransactions;

    // 2. Type Filter
    if (typeFilter !== 'all') {
      result = result.filter(tx => tx.type === typeFilter);
    }

    // 3. Search Filter
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(tx =>
        tx.title?.toLowerCase().includes(q) ||
        tx.expense_categories?.name?.toLowerCase().includes(q) ||
        new Date(tx.created_for_date || tx.created_at).toLocaleDateString().toLowerCase().includes(q)
      );
    }

    // Sort newest first
    return result.sort((a, b) => new Date(b.created_for_date || b.created_at).getTime() - new Date(a.created_for_date || a.created_at).getTime());
  }, [filteredTransactions, selectedFilter, typeFilter, searchQuery]);

  const totalPages = Math.max(1, Math.ceil(finalTransactions.length / itemsPerPage));
  const paginatedData = finalTransactions.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  return (
    <PageComponent>
      <section className='mt-5'>
        {/* HEADER */}
        <header className="flex flex-col md:flex-row md:items-end justify-between items-start gap-6 mb-8">
          <div className="flex flex-row items-center">
             <Button
              variant="link"
              size="icon"
              className="group h-8 px-2 text-muted-foreground hover:text-foreground mb-2 w-fit"
              onClick={() => router.back()}
            >
              <ArrowLeft size={14} className="mr-2 transition-transform duration-300 group-hover:-translate-x-1" />
            </Button>
            <HeaderTitle title="All Transactions" desc="View and filter all your past logs and transactions." />
          </div>

          <CurrencySwitcher
            currencies={availableCurrencies}
            activeCurrency={activeCurrency}
            onCurrencyChange={setActiveCurrency}
          />
        </header>

        {/* TABLE CONTROLS */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full lg:w-auto">
            <div className="relative w-full items-center sm:w-64">
              <Search className="absolute left-2.5 top-2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Filter transactions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 bg-card border-border/50 focus-visible:ring-1"
              />
            </div>

            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full sm:w-[140px] bg-card border-border/50">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="expense">Expense</SelectItem>
                  <SelectItem value="income">Income</SelectItem>
                  <SelectItem value="transfer">Transfer</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          <Tabs
            value={selectedFilter}
            onValueChange={setSelectedFilter}
            className="w-full sm:w-fit"
          >
            <TabsList className="w-full sm:w-auto bg-card border border-border/50">
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
        </div>

        {/* DATA TABLE */}
        <div className="rounded-xl border border-border/50 bg-card/50 overflow-hidden shadow-sm">
          <Table>
            <TableHeader className="bg-muted/30 hover:bg-muted/30">
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-12 text-center"></TableHead>
                <TableHead className="text-xs font-semibold text-muted-foreground">Note</TableHead>
                <TableHead className="text-xs font-semibold text-muted-foreground">Category</TableHead>
                <TableHead className="text-xs font-semibold text-muted-foreground">Wallet</TableHead>
                <TableHead className="text-xs font-semibold text-muted-foreground">Date</TableHead>
                <TableHead className="text-xs font-semibold text-muted-foreground text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                    No transactions found.
                  </TableCell>
                </TableRow>
              ) : (
                (() => {
                  let lastGroupKey = '';
                  const rows: React.ReactNode[] = [];

                  paginatedData.forEach((transaction) => {
                    const dateObj = new Date(transaction.created_for_date || transaction.created_at);

                    const groupKey = selectedFilter === 'all' ? null : getGroupKey(dateObj, selectedFilter);

                    if (groupKey && groupKey !== lastGroupKey) {
                      const groupTotal = finalTransactions
                        .filter(t => {
                          const d = new Date(t.created_for_date || t.created_at);
                          return getGroupKey(d, selectedFilter) === groupKey;
                        })
                        .reduce((sum, t) => sum + getSignedAmount({
                          amount: Number(t.amount),
                          transaction_type: t.type,
                          wallet_id: t.wallet_id,
                          to_wallet_id: (t as any).to_wallet_id || null
                        }, t.wallet_id), 0);

                      rows.push(
                        <TableRow key={`header-${groupKey}`} className="bg-muted/10 hover:bg-muted/10 border-b-border/50">
                          <TableCell colSpan={5} className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground py-2 pl-4">
                            {groupKey}
                          </TableCell>
                          <TableCell className={`text-right text-xs font-bold tabular-nums py-2 pr-4 ${groupTotal > 0 ? 'text-emerald-500' : groupTotal < 0 ? 'text-rose-500' : 'text-muted-foreground'}`}>
                            {formatSignedCurrency(groupTotal, activeCurrency, true)}
                          </TableCell>
                        </TableRow>
                      );
                      lastGroupKey = groupKey;
                    }

                    const signedAmount = getSignedAmount({
                      amount: Number(transaction.amount),
                      transaction_type: transaction.type,
                      wallet_id: transaction.wallet_id,
                      to_wallet_id: (transaction as any).to_wallet_id || null
                    }, transaction.wallet_id);

                    const isPositive = signedAmount > 0;
                    const isTransfer = transaction.type === 'transfer';

                    let amountColor = isTransfer ? 'text-muted-foreground' : isPositive ? 'text-emerald-500' : 'text-rose-500';

                    // Render Type Icon
                    let TypeIcon = ArrowDown;
                    let iconColor = 'text-rose-500';
                    let iconBg = 'bg-rose-500/10';

                    if (isTransfer) {
                      TypeIcon = ArrowRightLeft;
                      iconColor = 'text-yellow-500';
                      iconBg = 'bg-yellow-500/10';
                    } else if (transaction.type === 'income') {
                      TypeIcon = ArrowUp;
                      iconColor = 'text-emerald-500';
                      iconBg = 'bg-emerald-500/10';
                    }

                    // Render Wallet Name
                    const walletName = wallets.find(w => w.id === transaction.wallet_id)?.name || 'Unknown Wallet';

                    rows.push(
                      <TableRow key={transaction.id} className="group transition-colors hover:bg-secondary/20 border-b-border/50">
                        <TableCell className="w-12">
                          <div className={`h-8 w-8 rounded-full flex items-center justify-center ${iconBg} ${iconColor}`}>
                            <TypeIcon size={14} strokeWidth={2.5} />
                          </div>
                        </TableCell>

                        <TableCell className="text-sm text-muted-foreground max-w-[200px] truncate font-medium">
                          {transaction.title || '-'}
                        </TableCell>

                        <TableCell>
                          {isTransfer ? (
                            <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">Transfer</span>
                          ) : transaction.type === 'income' ? (
                            <span className="text-[10px] uppercase tracking-widest text-emerald-500 font-semibold">Income</span>
                          ) : (
                            <CategoryBadge
                              name={transaction.expense_categories?.name}
                              icon={transaction.expense_categories?.icon}
                              color={transaction.expense_categories?.color}
                            />
                          )}
                        </TableCell>

                        <TableCell className="text-xs font-medium text-muted-foreground">
                          {walletName}
                        </TableCell>

                        <TableCell className="font-medium text-[11px] text-muted-foreground/60 whitespace-nowrap">
                          {dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </TableCell>

                        <TableCell className={`text-right tabular-nums font-semibold ${amountColor}`}>
                          {formatSignedCurrency(signedAmount, activeCurrency, !isTransfer)}
                        </TableCell>
                      </TableRow>
                    );
                  });
                  return rows;
                })()
              )}
            </TableBody>
          </Table>
        </div>

        {/* PAGINATION */}
        {totalPages > 1 && (
          <div className="mt-6 flex items-center justify-between">
            <span className="text-sm text-muted-foreground pl-2">
              Showing {(page - 1) * itemsPerPage + 1} to {Math.min(page * itemsPerPage, finalTransactions.length)} of {finalTransactions.length} results
            </span>
            <Pagination className="w-auto mx-0">
              <PaginationContent>
                <PaginationItem>
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1 h-8"
                    disabled={page === 1}
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                  >
                    Previous
                  </Button>
                </PaginationItem>
                <PaginationItem>
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1 h-8"
                    disabled={page === totalPages}
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  >
                    Next
                  </Button>
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}
      </section>
    </PageComponent>
  );
}
