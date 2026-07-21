import { Wallet as WalletIcon } from 'lucide-react';
import { AddWalletModal } from '../modals/add-wallet/AddWalletModal';
import { WalletCard } from './wallet-Card';
import type { WalletSummary } from '@/types/dashboard';

interface WalletGridProps {
  wallets: WalletSummary[];
  isLoading?: boolean;
}

function WalletCardSkeleton() {
  return (
    <div
      className="h-[132px] rounded-xl border border-border/50 bg-card/30 animate-pulse"
      aria-hidden="true"
    />
  );
}

export function WalletGrid({ wallets, isLoading = false }: WalletGridProps) {
  return (
    <section aria-label="Your Accounts">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            Accounts
          </h2>
          <div className="flex items-center gap-2">
            <AddWalletModal />
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <WalletCardSkeleton key={`skeleton-${i}`} />
            ))}
          </div>
        ) : wallets.length === 0 ? (
          <div className="flex w-full flex-col items-center justify-center rounded-xl border border-dashed py-16 bg-card/30">
            <WalletIcon className="mb-3 h-8 w-8 text-muted-foreground" aria-hidden="true" />
            <p className="mb-4 text-sm text-muted-foreground">No accounts found.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
            {wallets.map((wallet) => (
              <WalletCard key={wallet.id} wallet={wallet} />
            ))}
          </div>
        )}
    </section>
  );
}
