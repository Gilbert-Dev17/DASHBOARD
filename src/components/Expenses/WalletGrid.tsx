import { Wallet as WalletIcon, ArrowRight } from 'lucide-react';
import { AddWalletModal } from '../Modals/AddWallet/AddWalletModal';
import { WalletCard } from './WalletCard';
import type { WalletSummary } from '@/types/dashboard';
import { Button } from '../ui/button';
import Link from 'next/link';
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
    <section aria-label="Your Accounts" className="flex flex-col">
      <div className="flex flex-row items-center justify-between space-y-0 pb-4">
        <h2 className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
          Accounts
        </h2>
        <div className="flex items-center gap-2">
          {wallets.length > 0 && (
            <Button asChild variant={'link'} className="group px-0 flex flex-row text-muted-foreground hover:text-foreground items-center gap-1">
              <Link href='/finance/viewAllAccounts'>
                <ArrowRight size={16} className="transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
            </Button>
          )}
        </div>
      </div>

      {isLoading ? (
        <div className="flex flex-col gap-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <WalletCardSkeleton key={`skeleton-${i}`} />
          ))}
        </div>
      ) : wallets.length === 0 ? (
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
      ) : (
        <div>
          <div className="flex flex-col gap-2">
            {sortedWallets.slice(0, 3).map((wallet) => (
              <Link key={wallet.id} href={`/finance/accounts/${wallet.id}`} className="block w-full">
                <WalletCard wallet={wallet} />
              </Link>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
