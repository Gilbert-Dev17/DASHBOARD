import { Wallet as WalletIcon, ArrowRight } from 'lucide-react';
import { AddWalletModal } from '../modals/add-wallet/AddWalletModal';
import { WalletCard } from './wallet-Card';
import type { WalletSummary } from '@/types/dashboard';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '../ui/card';
import {
  Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious,
} from "@/components/ui/carousel";
import { Button } from '../ui/button';
import Link from 'next/link'

interface WalletGridProps {
  wallets: WalletSummary[];
  isLoading?: boolean;
}

function WalletCardSkeleton() {
  return (
    <div
      className="h-33 rounded-xl border border-border/50 bg-card/30 animate-pulse"
      aria-hidden="true"
    />
  );
}

export function WalletGrid({ wallets, isLoading = false }: WalletGridProps) {
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
          <Carousel opts={{ align: "start" }} className="w-full">
            <CarouselContent className="-ml-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <CarouselItem key={`skeleton-${i}`} className="pl-4 basis-full xl:basis-1/2">
                  <WalletCardSkeleton />
                </CarouselItem>
              ))}
            </CarouselContent>
          </Carousel>
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
          <Carousel opts={{ align: "start" }} className="w-full">
            <CarouselContent className="-ml-4">
              {wallets.map((wallet) => (
                <CarouselItem key={wallet.id} className="pl-4 basis-full xl:basis-1/2">
                  <Link key={wallet.id} href={`/finance/accounts/${wallet.id}`}>
                    <WalletCard wallet={wallet} />
                  </Link>
                </CarouselItem>
              ))}
            </CarouselContent>
            <div className='flex flex-row justify-between items-center mt-6'>
               {/* {wallets.length > 2 && ( */}
                <div className="hidden sm:flex gap-2">
                  <CarouselPrevious className="static translate-y-0 my-0" />
                  <CarouselNext className="static translate-y-0 my-0" />
                </div>

                <Button asChild variant={'link'} className="group px-0 flex flex-row text-muted-foreground hover:text-foreground items-center gap-1"
                  >
                    <Link href='/finance/viewAllAccounts'>
                      View All Wallets <ArrowRight size={16} className="transition-transform duration-300 group-hover:translate-x-1" />
                    </Link>
                </Button>
            </div>
          </Carousel>
        </CardContent>
      )}
    </Card>
  );
}
