'use client'

import { ArrowLeft, Wallet as WalletIcon } from 'lucide-react'
import PageComponent from '@/components/shared/PageComponent'
import { Button } from '@/components/ui/button'
import { WalletCard } from '@/components/expenses/WalletCard'
import { type Wallets, TransactionHistory } from '@/types/expenses'
import Link from 'next/link'
import { HeaderTitle } from '@/components/shared/HeaderTitle'
import { useRouter } from 'next/navigation'

interface ViewAllAccountsClientProps {
  wallets: (Wallets & { transactions: TransactionHistory[] })[]
}

export function ViewAllAccountsClient({ wallets }: ViewAllAccountsClientProps) {

  const router = useRouter();

  return (
    <PageComponent>
      <section className='mt-5'>
        {/* HEADER */}
        <header className="flex flex-col md:flex-row md:items-end justify-between items-start gap-6 mb-12">
          <div className="flex flex-row items-center gap-2">
            <Button
              variant="link"
              size="icon"
              className="group h-8 px-2 text-muted-foreground hover:text-foreground mb-2 w-fit"
              onClick={() => router.back()}
            >
              <ArrowLeft size={14} className="transition-transform duration-300 group-hover:-translate-x-1" />
            </Button>
            <HeaderTitle title="All Wallets" desc="Manage and view all your active wallets." />
          </div>
        </header>

        {/* CONTENT */}
        {wallets.length === 0 ? (
          <div className="flex w-full flex-col items-center justify-center rounded-xl border border-dashed py-24 bg-card/30">
            <WalletIcon className="mb-3 h-10 w-10 text-muted-foreground/50" aria-hidden="true" />
            <p className="mb-1 text-base font-medium text-foreground/80">No accounts found</p>
            <p className="text-sm text-muted-foreground">You haven't added any wallets yet.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-12">
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
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {currencyWallets.map((wallet) => (
                    <Link key={wallet.id} href={`/finance/viewAllAccounts/${wallet.id}`}>
                      <WalletCard key={wallet.id} wallet={wallet as any} />
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </PageComponent>
  )
}
