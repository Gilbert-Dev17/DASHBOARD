'use client'

import React, {useState} from 'react'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
} from "@/components/ui/carousel"
import { WalletSummary } from '@/types/dashboard'

interface walletDataProps { walletData: WalletSummary[] }

export const WalletCarousel = ({ walletData } : walletDataProps) => {

    const selectedWallet = walletData || [];

  return (
    <section aria-labelledby="finances-heading">
      <Carousel className="w-full max-w-sm" opts={{ align: "start" }}>
        <div className="flex items-center justify-between mb-6 lg:mb-8">
          <h2 id="finances-heading" className="text-xs font-semibold uppercase tracking-[0.2em] transition-colors duration-500">
            Accounts
          </h2>
          <div className="flex gap-2">
            <CarouselPrevious className="static translate-y-0 h-8 w-8 border-transparent bg-transparent hover:bg-muted text-muted-foreground" />
            <CarouselNext className="static translate-y-0 h-8 w-8 border-transparent bg-transparent hover:bg-muted text-muted-foreground" />
          </div>
        </div>
        <CarouselContent>
            {selectedWallet.length === 0 ? (
                <p className="text-muted-foreground py-4">You have no wallets set.</p>
            ):( selectedWallet.map((w) => {

                const formattedBalance = new Intl.NumberFormat('en-US', {
                  style: 'currency',
                  currency: w.currency,
                }).format(w.balance);

                const [dollars, cents] = formattedBalance.split('.');

                return (
                <CarouselItem key={w.id} className="basis-[85%] lg:basis-full pl-4">
                    <div className="flex flex-col gap-2 p-1">
                        <span className="text-sm text-muted-foreground">{w.name}</span>
                        <div className="text-4xl md:text-5xl lg:text-6xl font-light tracking-tighter tabular-nums">
                        {dollars}<span className="text-3xl lg:text-4xl">.{cents}</span>
                        </div>
                    </div>
                </CarouselItem>
                )
            })
            )}
        </CarouselContent>
      </Carousel>
    </section>
  )
}
