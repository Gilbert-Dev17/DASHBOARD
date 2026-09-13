'use client'

import { Wallet as WalletIcon } from 'lucide-react'
import PageComponent from '@/components/Shared/PageComponent'
import { PageHeader } from '@/components/Shared/PageHeader'
import { WalletCard } from '@/components/Expenses/WalletCard'
import { type Wallets, TransactionHistory } from '@/types/expenses'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { AddWalletModal } from '@/components/Modals/AddWallet/AddWalletModal'

interface ViewAllAccountsClientProps {
  wallets: (Wallets & { transactions: TransactionHistory[] })[]
}

export function ViewAllAccountsClient({ wallets }: ViewAllAccountsClientProps) {

  const router = useRouter();

  return (
    <PageComponent>
        {/* HEADER */}
        <PageHeader title="All Wallets">
          <AddWalletModal />
        </PageHeader>

        {/* CONTENT */}
        {wallets.length === 0 ? (
          <div className="flex w-full flex-col items-center justify-center rounded-xl border border-dashed py-24 bg-card/30">
            <WalletIcon className="mb-3 h-10 w-10 text-muted-foreground/50" aria-hidden="true" />
            <p className="mb-1 text-base font-medium text-foreground/80">No accounts found</p>
            <p className="text-sm text-muted-foreground">You haven&apos;t added any wallets yet.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-12 w-full">
            {Object.entries(
              wallets.reduce((acc, wallet) => {
                const currency = wallet.currency || 'PHP';
                if (!acc[currency]) acc[currency] = [];
                acc[currency].push(wallet);
                return acc;
              }, {} as Record<string, typeof wallets>)
            ).map(([currency, currencyWallets]) => (
              <div key={currency} className="space-y-4">
                <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground border-b border-border/50 pb-2">
                  {currency} Wallets
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
                  {currencyWallets.map((wallet) => (
                    <Link key={wallet.id} href={`/finance/viewAllAccounts/${wallet.id}`} className="block w-full">
                      <WalletCard key={wallet.id} wallet={wallet as React.ComponentProps<typeof WalletCard>['wallet']} />
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
    </PageComponent>
  )
}
