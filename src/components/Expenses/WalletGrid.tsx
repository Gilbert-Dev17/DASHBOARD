import { Wallet as WalletIcon, ArrowRight } from 'lucide-react';
import { AddWalletModal } from '../Modals/AddWallet/AddWalletModal';
import { WalletCard } from './WalletCard';
import type { WalletSummary } from '@/types/dashboard';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import Link from 'next/link'
import { Empty, EmptyContent, EmptyMedia, EmptyTitle, EmptyDescription } from '@/components/ui/empty';

import { TransactionHistory } from '@/types/expenses';

interface WalletGridProps {
  wallets: WalletSummary[];
  transactions?: TransactionHistory[];
  isLoading?: boolean;
}

function WalletCardSkeleton() {
  return (
    <div
      className="h-33 rounded-xl border border-border/50 bg-card/30 animate-pulse w-full"
      aria-hidden="true"
    />
  );
}

export function WalletGrid({ wallets, transactions = [], isLoading = false }: WalletGridProps) {
  // Sort wallets by usage (most transactions first)
  const sortedWallets = [...wallets].sort((a, b) => {
    const aUsage = transactions.filter(t => t.wallet_id === a.id || t.to_wallet_id === a.id).length;
    const bUsage = transactions.filter(t => t.wallet_id === b.id || t.to_wallet_id === b.id).length;
    return bUsage - aUsage;
  });

  return (
    <Card aria-label="Your Accounts" className="bg-card/30">
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
          Accounts
        </CardTitle>
        <div className="flex items-center gap-2">
          {wallets.length > 0 && <AddWalletModal />}
        </div>
      </CardHeader>

      {isLoading ? (
        <CardContent>
          <div className="flex flex-col gap-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <WalletCardSkeleton key={`skeleton-${i}`} />
            ))}
          </div>
        </CardContent>
      ) : wallets.length === 0 ? (
        <CardContent>
          <Empty className="py-12 bg-card/30">
            <EmptyContent>
              <EmptyMedia variant="icon">
                <WalletIcon className="h-6 w-6" aria-hidden="true" />
              </EmptyMedia>
              <EmptyTitle>No accounts yet</EmptyTitle>
              <EmptyDescription className="mb-4">
                Get started by adding your first wallet or bank account.
              </EmptyDescription>
              <AddWalletModal />
            </EmptyContent>
          </Empty>
        </CardContent>
      ) : (
        <CardContent>
          <div className="flex flex-col gap-2">
            {sortedWallets.slice(0, 3).map((wallet) => (
              <Link key={wallet.id} href={`/finance/accounts/${wallet.id}`} className="block w-full">
                <WalletCard wallet={wallet} />
              </Link>
            ))}
          </div>
            <div className='flex flex-row justify-end items-center mt-4'>
              <Button asChild variant={'link'} className="group px-0 flex flex-row text-muted-foreground hover:text-foreground items-center gap-1">
                <Link href='/finance/viewAllAccounts'>
                  View All<ArrowRight size={16} className="transition-transform duration-300 group-hover:translate-x-1" />
                </Link>
              </Button>
            </div>
        </CardContent>
      )}
    </Card>
  );
}
