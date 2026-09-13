'use client';

import { useMemo, useState, useEffect } from 'react';
import { Search, ChevronDown, ChevronRight, ChevronsUpDown } from 'lucide-react';
import PageComponent from '@/components/Shared/PageComponent';
import { PageHeader } from '@/components/Shared/PageHeader';
import { getSignedAmount, formatSignedCurrency } from '@/utils/currency';
import { TransactionHistory } from '@/types/expenses';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table"
import {
  Pagination, PaginationContent, PaginationItem,
} from "@/components/ui/pagination"

import { CurrencySwitcher } from '@/components/Shared/CurrencySwitcher';
import { WalletSummary, UserSummary } from '@/types/dashboard';
import { useCurrencyFilter } from '@/hooks/useCurrencyFilter';
import { CategoryBadge } from '@/components/Shared/CategoryBadge';
import { TransactionActionsMenu } from '@/components/Shared/TransactionActionsMenu';
import { TIME_FILTERS, TRANSACTION_TYPE_OPTIONS, ITEMS_PER_PAGE } from '@/lib/constants/options';

function getWeekKey(date: Date) {
  const start = new Date(date);
  start.setDate(date.getDate() - date.getDay());
  return `Week of ${start.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
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
  const [selectedFilter, setSelectedFilter] = useState('day');
  const [typeFilter, setTypeFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set());

  const toggleGroup = (groupKey: string) => {
    setCollapsedGroups(prev => {
      const next = new Set(prev);
      if (next.has(groupKey)) next.delete(groupKey);
      else next.add(groupKey);
      return next;
    });
  };

  const { availableCurrencies, activeCurrency, setActiveCurrency, filteredTransactions } = useCurrencyFilter({ wallets, user, transactions });
  const [prevDeps, setPrevDeps] = useState([selectedFilter, typeFilter, searchQuery, activeCurrency]);
  const [page, setPage] = useState(1);

  if (
    prevDeps[0] !== selectedFilter ||
    prevDeps[1] !== typeFilter ||
    prevDeps[2] !== searchQuery ||
    prevDeps[3] !== activeCurrency
  ) {
    if (prevDeps[0] !== selectedFilter) {
      setCollapsedGroups(new Set());
    }
    setPrevDeps([selectedFilter, typeFilter, searchQuery, activeCurrency]);
    setPage(1);
  }

  const finalTransactions = useMemo(() => {
    let result = filteredTransactions;

    if (typeFilter !== 'all') {
      result = result.filter(tx => tx.type === typeFilter);
    }

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(tx =>
        tx.note?.toLowerCase().includes(q) ||
        tx.expense_categories?.name?.toLowerCase().includes(q) ||
        new Date(tx.created_for_date || tx.created_at).toLocaleDateString().toLowerCase().includes(q)
      );
    }

    return result.sort((a, b) => new Date(b.created_for_date || b.created_at).getTime() - new Date(a.created_for_date || a.created_at).getTime());
  }, [filteredTransactions, typeFilter, searchQuery]);

  const { allGroupKeys, groupTotals } = useMemo(() => {
    const keys = new Set<string>();
    const totals = new Map<string, number>();

    finalTransactions.forEach(tx => {
      const d = new Date(tx.created_for_date || tx.created_at);
      const k = selectedFilter === 'all' ? null : getGroupKey(d, selectedFilter);
      if (k) {
        keys.add(k);
        const amount = getSignedAmount({
          amount: Number(tx.amount),
          transaction_type: tx.type,
          wallet_id: tx.wallet_id,
          to_wallet_id: (tx as TransactionHistory & { to_wallet_id?: string }).to_wallet_id || null
        });
        totals.set(k, (totals.get(k) || 0) + amount);
      }
    });

    return { allGroupKeys: keys, groupTotals: totals };
  }, [finalTransactions, selectedFilter]);

  const isAllCollapsed = allGroupKeys.size > 0 && collapsedGroups.size === allGroupKeys.size;

  const toggleAllGroups = () => {
    if (isAllCollapsed) {
      setCollapsedGroups(new Set());
    } else {
      setCollapsedGroups(allGroupKeys);
    }
  };

  // Wallet lookup map — O(1) instead of O(n) per row
  const walletMap = useMemo(() => {
    const map = new Map<string, string>();
      wallets.forEach(w => map.set(w.id, w.name));
    return map;
  }, [wallets]);

  // Virtual-row pagination: counts visible rows (collapsed group = 1 row)
  const { paginatedData, totalPages, visibleCount } = useMemo(() => {
    let visibleRows = 0;     // how many visible rows we've counted total
    let pageStart = -1;      // index where current page starts
    let pageEnd = -1;        // index where current page ends
    const seenGroups = new Set<string>();
    const targetStart = (page - 1) * ITEMS_PER_PAGE;

    let pageEndFound = false;
    for (let i = 0; i < finalTransactions.length; i++) {
      const tx = finalTransactions[i];
      const d = new Date(tx.created_for_date || tx.created_at);
      const gk = selectedFilter === 'all' ? null : getGroupKey(d, selectedFilter);

      if (gk && collapsedGroups.has(gk)) {
        // Collapsed group: only the header counts as 1 visible row (first time we see it)
        if (!seenGroups.has(gk)) {
          seenGroups.add(gk);
          if (visibleRows >= targetStart && pageStart === -1) pageStart = i;
          visibleRows++;
        }
        // Skip this transaction — it's hidden under a collapsed header
        continue;
      }

      // Expanded group header (first time) counts as 1 visible row
      if (gk && !seenGroups.has(gk)) {
        seenGroups.add(gk);
        if (visibleRows >= targetStart && pageStart === -1) pageStart = i;
        visibleRows++;
      }

      // The transaction itself counts as 1 visible row
      if (visibleRows >= targetStart && pageStart === -1) pageStart = i;
      visibleRows++;

      // Check if we've filled this page
      if (pageStart !== -1 && !pageEndFound && visibleRows >= targetStart + ITEMS_PER_PAGE) {
        pageEnd = i + 1;
        pageEndFound = true;
        // Keep counting remaining visible rows for total page count
      }
    }

    const totalVisible = visibleRows;
    const pages = Math.max(1, Math.ceil(totalVisible / ITEMS_PER_PAGE));

    if (pageStart === -1) pageStart = 0;
    if (pageEnd === -1) pageEnd = finalTransactions.length;

    return {
      paginatedData: finalTransactions.slice(pageStart, pageEnd),
      totalPages: pages,
      visibleCount: totalVisible,
    };
  }, [finalTransactions, selectedFilter, collapsedGroups, page]);

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [totalPages, page]);

  return (
    <PageComponent>
        <PageHeader title="History">
          <CurrencySwitcher
            currencies={availableCurrencies}
            activeCurrency={activeCurrency}
            onCurrencyChange={setActiveCurrency}
          />
        </PageHeader>

        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full lg:w-auto">
            <div className="relative w-full items-center sm:w-64 rounded-none">
              <Search className="absolute left-2.5 top-2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Filter transactions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 bg-card border-border/50 focus-visible:ring-1 rounded-none"
              />
            </div>

            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full sm:w-35 bg-card border-border/50 rounded-none">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent className="bg-card border-border/50 rounded-none">
                <SelectGroup>
                  {TRANSACTION_TYPE_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value} className='rounded-none'>{opt.label}</SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2 w-full lg:w-auto">

            <Tabs
              value={selectedFilter}
              onValueChange={setSelectedFilter}
              className="w-full sm:w-fit"
            >
              <TabsList className="w-full sm:w-auto bg-card border border-border/50">
                {TIME_FILTERS.map((filter) => (
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

            <Button
              variant="outline"
              size="icon"
              className=" shrink-0 bg-card border-border/50 rounded-none"
              onClick={toggleAllGroups}
              title={isAllCollapsed ? "Expand All" : "Collapse All"}
            >
              <ChevronsUpDown className="h-4 w-4 text-muted-foreground" />
            </Button>
          </div>
        </div>

        <div className="rounded-none border border-border/50 bg-card/50 overflow-hidden shadow-sm">
          <Table>
            <TableHeader className="bg-muted/30 hover:bg-muted/30">
              <TableRow className="hover:bg-transparent">
                <TableHead className="h-10 px-4 text-xs text-muted-foreground">Date</TableHead>
                <TableHead className="h-10 px-4 text-xs text-muted-foreground">Wallet</TableHead>
                <TableHead className="h-10 px-4 text-xs text-muted-foreground">Note</TableHead>
                <TableHead className="h-10 px-4 text-xs text-muted-foreground">Category</TableHead>
                <TableHead className="h-10 px-4 text-xs text-right text-muted-foreground">Amount</TableHead>
                <TableHead className="h-10 w-12 px-2 text-center text-xs text-muted-foreground">Action</TableHead>
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
                      const groupTotal = groupTotals.get(groupKey) || 0;

                      rows.push(
                        <TableRow
                          key={`header-${groupKey}`}
                          className="bg-muted/10 hover:bg-muted/20 border-b-border/50 cursor-pointer"
                          onClick={() => toggleGroup(groupKey!)}
                        >
                          <TableCell colSpan={5} className="py-3 px-4 ">
                            <div className="flex items-center justify-between w-full gap-4">
                              <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground whitespace-nowrap">
                                {groupKey}
                              </span>
                              <span className={`text-right text-sm font-mono font-bold tabular-nums ${groupTotal > 0 ? 'text-emerald-500' : groupTotal < 0 ? 'text-rose-500' : 'text-muted-foreground'}`}>
                                {formatSignedCurrency(groupTotal, activeCurrency, true)}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="w-12 px-2 py-3 text-center">
                            <div className="flex items-center justify-center">
                              <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground pointer-events-none">
                                {collapsedGroups.has(groupKey!) ? <ChevronRight className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                      lastGroupKey = groupKey;
                    }

                    if (groupKey && collapsedGroups.has(groupKey)) {
                      return;
                    }

                    const signedAmount = getSignedAmount({
                      amount: Number(transaction.amount),
                      transaction_type: transaction.type,
                      wallet_id: transaction.wallet_id,
                      to_wallet_id: (transaction as TransactionHistory & { to_wallet_id?: string }).to_wallet_id || null
                    });

                    const isPositive = signedAmount > 0;
                    const isTransfer = transaction.type === 'transfer';

                    const amountColor = isTransfer ? 'text-yellow-500' : isPositive ? 'text-emerald-500' : 'text-rose-500';

                    const walletName = walletMap.get(transaction.wallet_id) || 'Unknown Wallet';

                    rows.push(
                      <TableRow key={transaction.id} className="group transition-colors hover:bg-secondary/20 border-b-border/50">
                        <TableCell className="px-4 py-3 font-medium text-[11px] text-muted-foreground/60 whitespace-nowrap">
                          {dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </TableCell>

                        <TableCell className="px-4 py-3 text-xs font-medium text-muted-foreground">
                          {walletName}
                        </TableCell>

                        <TableCell className="px-4 py-3 text-sm text-muted-foreground max-w-[200px] sm:max-w-[300px] truncate font-medium">
                          {transaction.note || '-'}
                        </TableCell>

                        <TableCell className="px-4 py-3">
                          {isTransfer ? (
                            <span className="text-xs uppercase tracking-widest text-muted-foreground font-semibold">Transfer</span>
                          ) : (
                            transaction.type === 'adjustment' ? (
                              <span className="text-xs uppercase tracking-widest text-muted-foreground font-semibold">Adjustment</span>
                          ) : transaction.type === 'income' ? (
                            <span className="text-xs uppercase tracking-widest text-emerald-500 font-semibold">Income</span>
                          ) : (
                            <CategoryBadge
                              name={transaction.expense_categories?.name}
                              icon={transaction.expense_categories?.icon}
                              color={transaction.expense_categories?.color}
                              badgePill={false}
                            />
                          ))}
                        </TableCell>

                        <TableCell className={`px-4 py-3 text-xs tabular-nums font-mono text-right ${amountColor}`}>
                          {formatSignedCurrency(signedAmount, activeCurrency, !isTransfer)}
                        </TableCell>

                        <TableCell className="w-12 px-2 py-3 text-center">
                          <div className="flex items-center justify-center">
                            <TransactionActionsMenu transaction={transaction} />
                          </div>
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
              Showing page {page} of {totalPages} ({visibleCount} items)
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
    </PageComponent>
  );
}
