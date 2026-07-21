'use client'

import { ArrowLeft, Wallet as WalletIcon } from 'lucide-react'
import PageComponent from '@/components/shared/PageComponent'
import { Button } from '@/components/ui/button'
import { WalletCard } from '@/components/expenses/wallet-Card'
import { type Wallets, TransactionHistory } from '@/types/expenses'
import Link from 'next/link'

interface ViewAllAccountsClientProps {
  wallets: (Wallets & { transactions: TransactionHistory[] })[]
}

export function ViewAllAccountsClient({ wallets }: ViewAllAccountsClientProps) {
  return (
    <PageComponent>
      <section className='mt-5'>
        {/* HEADER */}
        <header className="flex flex-col md:flex-row md:items-end justify-between items-start gap-6 mb-12">
          <div className="flex flex-col gap-2">
            <Link href="/finance" className="mb-2">
              <Button variant="ghost" size="sm" className="h-8 px-2 text-muted-foreground hover:text-foreground">
                <ArrowLeft size={14} className="mr-2" />
                Back to Finance
              </Button>
            </Link>
            <h1 className="text-3xl font-light tracking-tight">
              All Wallets
            </h1>
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {wallets.map((wallet) => (
              <Link key={wallet.id} href={`/finance/viewAllAccounts/${wallet.id}`}>
                <WalletCard key={wallet.id} wallet={wallet as any} />
              </Link>
            ))}
          </div>
        )}
      </section>
    </PageComponent>
  )
}
