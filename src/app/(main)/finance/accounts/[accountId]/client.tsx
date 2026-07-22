'use client';

import Link from 'next/link';
import { ArrowLeft, Wallet as WalletIcon, CreditCard, MoreHorizontal, Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatCurrency, formatSignedCurrency } from '@/utils/currency';
import { useState, useEffect } from 'react';
import { withAlpha } from '@/utils/color';
import { Timeline, TimelineItem, TimelineTime, TimelineContent } from '@/components/ui/timeline';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { EditWalletModal } from '@/components/modals/edit-wallet/EditWalletModal';
import { DeleteWalletModal } from '@/components/modals/delete-wallet/DeleteWalletModal';
import PageComponent from '@/components/shared/PageComponent';
import { Wallets, TransactionHistory } from '@/types/expenses';
import { getSignedAmount } from '@/utils/currency';
import { useRouter } from 'next/navigation';

interface AccountStatementProps {
  accountData: (Wallets & { transactions: TransactionHistory[] }) | null
}

import { AVAILABLE_ICONS } from '@/lib/constants/categories';

export function AccountStatement({accountData} : AccountStatementProps) {

  const [page, setPage] = useState(1);
  const itemsPerPage = 30;
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (accountData?.id) {
      setPage(1);
    }
  }, [accountData?.id]);

  if (!accountData || !accountData.id) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
        <h2 className="text-2xl font-semibold mb-2">Account Not Found</h2>
        <p className="text-muted-foreground mb-6">We couldn't find the account you're looking for.</p>
        <Button variant="outline" onClick={() => router.back()}>Back</Button>
      </div>
    );
  }

  const isLiability = accountData.type === 'Credit' || accountData.type === 'Loans';
  const iconObj = AVAILABLE_ICONS.find(i => i.name === accountData.icon);
  const DynamicIcon = (iconObj?.icon || (isLiability ? CreditCard : WalletIcon)) as React.ElementType;
  const color = accountData.color || (isLiability ? '#ef4444' : '#888888');

  const transactions = accountData.transactions || [];
  const totalPages = Math.ceil(transactions.length / itemsPerPage);
  const paginatedTransactions = transactions.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  return (
    <PageComponent>

    <div className=" mx-auto w-full pt-6">
      {/* HEADER */}
      <header className="flex flex-col gap-6 mb-12">
        <div className="flex justify-between items-center w-full">

          <Button
            variant="ghost"
            size="sm"
            className="h-8 px-2 text-muted-foreground hover:text-foreground w-fit"
            onClick={() => router.back()}
          >
            <ArrowLeft size={14} className="mr-2" />
            Back
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
                <MoreHorizontal size={16} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className='w-full'>
              <DropdownMenuItem onClick={() => setIsEditModalOpen(true)} className="cursor-pointer">
                <Edit className="mr-2 h-4 w-4" />
                Edit Account
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setIsDeleteModalOpen(true)} className="text-rose-500 focus:text-rose-500 cursor-pointer">
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Account
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="flex items-center gap-4">
            <div
              className="p-4 rounded-2xl border border-border/50 shadow-sm transition-colors duration-300"
              style={{ backgroundColor: withAlpha(color, 0.15), color: color }}
            >
              <DynamicIcon size={32} />
            </div>
            <div>
              <h1 className="text-3xl font-light tracking-tight">{accountData.name}</h1>
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
                {accountData.type}
              </span>
            </div>
          </div>

          <div className="flex flex-col md:text-right">
            <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-semibold mb-1">Current Balance</span>
            <div className={`text-4xl tabular-nums font-mono tracking-tighter flex md:justify-end items-baseline`}>
              {formatCurrency(accountData.balance, accountData.currency)}
            </div>
          </div>
        </div>
      </header>

      {/* TRANSACTIONS SECTION */}
      <section className="bg-card/30 border border-dashed border-border/50 rounded-3xl p-6 md:p-8">
        <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground mb-8">Statement Activity</h2>

        {transactions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-muted-foreground text-sm">
            No recent activity for this account.
          </div>
        ) : (
          <>
            <Timeline>
              {paginatedTransactions.map((txn: TransactionHistory, index: number) => {
                const dateObj = new Date(txn.created_for_date || txn.created_at || new Date());
                 const signedAmount = getSignedAmount({
                    amount: Number(txn.amount),
                    transaction_type: txn.type,
                    wallet_id: txn.wallet_id,
                    to_wallet_id: (txn as any).to_wallet_id || null
                  }, txn.wallet_id)

                  const isPositive = signedAmount > 0;
                  const isTransfer = txn.type === 'transfer';

                  const colorClass = isTransfer ? 'text-muted-foreground' : isPositive
                  ? 'text-emerald-500' : 'text-rose-500';

                return (
                  <TimelineItem key={`${txn.id}-${index}`}>
                    <TimelineTime dateTime={txn.created_for_date || txn.created_at || ''}>
                      {dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </TimelineTime>

                    <TimelineContent>
                      <div className="flex flex-col py-3 px-4 -ml-4 rounded-xl hover:bg-secondary/40 transition-colors group">
                        <div className="flex justify-between items-start gap-4">
                          <span className="font-medium text-[15px] leading-tight text-foreground/90 group-hover:text-foreground">{txn.title}</span>
                          <span className={`tabular-nums font-mono shrink-0 ${colorClass}`}>
                            {formatSignedCurrency(signedAmount, txn.wallets?.currency, !isTransfer)}
                          </span>
                        </div>
                        <div className="text-[10px] uppercase tracking-wider text-muted-foreground/80 mt-1.5 flex items-center gap-2">
                          <span>{txn.expense_categories?.name || txn.type}</span>
                        </div>
                      </div>
                    </TimelineContent>
                  </TimelineItem>
                )
              })}
            </Timeline>

            {totalPages > 1 && (
              <div className="mt-12">
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          setPage((p) => Math.max(1, p - 1));
                        }}
                        disabled={page === 1}
                        className={`inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2 gap-1 pl-2.5 ${page === 1 ? "pointer-events-none opacity-50" : ""}`}
                        aria-label="Go to previous page"
                      >
                        <ArrowLeft className="h-4 w-4" />
                        <span>Previous</span>
                      </button>
                    </PaginationItem>

                    <PaginationItem>
                      <span className="text-sm text-muted-foreground px-4">
                        Page {page} of {totalPages}
                      </span>
                    </PaginationItem>

                    <PaginationItem>
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          setPage((p) => Math.min(totalPages, p + 1));
                        }}
                        disabled={page === totalPages}
                        className={`inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2 gap-1 pr-2.5 ${page === totalPages ? "pointer-events-none opacity-50" : ""}`}
                        aria-label="Go to next page"
                      >
                        <span>Next</span>
                        <ArrowLeft className="h-4 w-4 rotate-180" />
                      </button>
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            )}
          </>
        )}
      </section>

      <EditWalletModal
        wallet={accountData}
        isOpen={isEditModalOpen}
        setIsOpen={setIsEditModalOpen}
      />
      <DeleteWalletModal
        walletId={accountData.id}
        isOpen={isDeleteModalOpen}
        setIsOpen={setIsDeleteModalOpen}
      />
    </div>
    </PageComponent>
  );
}
