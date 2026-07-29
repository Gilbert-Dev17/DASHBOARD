import { Wallet as WalletIcon, ArrowRight } from 'lucide-react';
import { AddWalletModal } from '../Modals/AddWallet/AddWalletModal';
import { WalletCard } from './WalletCard';
import type { WalletSummary } from '@/types/dashboard';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '../ui/card';
import { Button } from '../ui/button';
import Link from 'next/link'

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
    const aUsage = transactions.filter(t => t.wallet_id === a.id || (t as any).to_wallet_id === a.id).length;
    const bUsage = transactions.filter(t => t.wallet_id === b.id || (t as any).to_wallet_id === b.id).length;
    return bUsage - aUsage;
  });

  return (
    <Card aria-label="Your Accounts" className="bg-card/30">
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
          Accounts
        </CardTitle>
        <div className="flex items-center gap-2">
          <AddWalletModal />
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
          <div className="flex w-full flex-col items-center justify-center rounded-xl border border-dashed py-16 bg-card/30">
            <WalletIcon className="mb-3 h-8 w-8 text-muted-foreground" aria-hidden="true" />
            <p className="mb-4 text-sm text-muted-foreground">No accounts found.</p>
          </div>
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
