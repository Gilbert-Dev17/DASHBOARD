import React from 'react'
import Link from 'next/link'

import { TrendingUp, TrendingDown, Wallet as WalletIcon, CreditCard, } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious,
} from "@/components/ui/carousel"
import { formatCurrency } from '@/utils/currency'
import { summary as mockSummary, categories as mockCategories, recentTransactions as mockTransactions, mockWallets } from '@/lib/mockData'
import { FinancialSummary, CategorySummary, Transaction } from '@/types/expenses'


interface walletProps{
  wallets: FinancialSummary & { trend?: number };
}

export const WalletCarousel = ({wallets} : walletProps) => {
  return (
    <section aria-label="Your Wallets" className="mb-16">
        <Carousel className="w-full" opts={{ align: "start", dragFree: true }}>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Accounts</h2>
            <div className="flex items-center gap-2">
              <CarouselPrevious className="static transform-none translate-x-0 translate-y-0" />
              <CarouselNext className="static transform-none translate-x-0 translate-y-0" />
            </div>
          </div>

          <CarouselContent className="ml-4">
            {mockWallets.map((wallet) => {
              const Icon = wallet.type === 'asset' ? WalletIcon : CreditCard;
              const isLiability = wallet.type === 'liability';

              return (
                <CarouselItem key={wallet.id} className="basis-[85%] md:basis-1/2 lg:basis-1/3 xl:basis-1/4 p-1">
                  <Link href={`/expenses/accounts/${wallet.id}`} className="block h-full cursor-pointer group">
                    <Card className="h-full flex flex-col justify-between hover:bg-secondary/20 group-hover:bg-secondary/40 transition-colors">
                      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-sm font-medium text-foreground/80">{wallet.name}</CardTitle>
                        <Icon size={16} className={isLiability ? "text-destructive/70" : "text-muted-foreground"} />
                      </CardHeader>
                      <CardContent>
                        <div className={`text-2xl tabular-nums font-mono ${isLiability ? "text-destructive/90" : "text-foreground"}`}>
                          {isLiability ? "-" : ""}{formatCurrency(wallet.balance, wallets.currency)}
                        </div>
                        <div className="flex items-center justify-between mt-2">
                          <p className="text-[10px] uppercase tracking-wider text-accent">
                            {isLiability ? "Liability" : "Asset"}
                          </p>
                          {wallet.trend !== undefined && (
                            <div className={`flex items-center gap-1 text-[10px] font-medium ${
                              wallet.trend >= 0 ? 'text-emerald-500' : 'text-rose-500'
                            }`}>
                              {wallet.trend >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                              {Math.abs(wallet.trend)}%
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                </CarouselItem>
              )
            })}
          </CarouselContent>
        </Carousel>
      </section>
  )
}