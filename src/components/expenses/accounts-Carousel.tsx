import { Wallet as WalletIcon } from 'lucide-react';
import { AddWalletModal } from '../modals/add-wallet/AddWalletModal';
import { WalletCard } from './wallet-Card';
import type { WalletSummary } from '@/types/dashboard';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"

interface WalletCarouselProps {
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

export function WalletCarousel({ wallets, isLoading = false }: WalletCarouselProps) {
  return (
    <section aria-label="Your Wallets">
      <Carousel
        opts={{
          align: "start",
        }}
        className="w-full relative"
      >
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            Accounts
          </h2>
          <div className="flex items-center gap-2">
            <AddWalletModal />
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <WalletCardSkeleton key={`skeleton-${i}`} />
            ))}
          </div>
        ) : wallets.length === 0 ? (
          <div className="flex w-full flex-col items-center justify-center rounded-xl border border-dashed py-16 bg-card/30">
            <WalletIcon className="mb-3 h-8 w-8 text-muted-foreground/50" aria-hidden="true" />
            <p className="mb-4 text-sm text-muted-foreground">No accounts found.</p>
          </div>
        ) : (
          <CarouselContent className="-ml-4">
            {wallets.map((wallet) => (
              <CarouselItem key={wallet.id} >
                {/* <div className="h-35.5"> */}
                  <WalletCard wallet={wallet} />
                {/* </div> */}
              </CarouselItem>
            ))}
          </CarouselContent>
        )}

         <div className="flex justify-end gap-1 pt-5">
          <CarouselPrevious variant="outline" className="relative inset-auto translate-y-0 h-8 w-8 bg-card/50" />
          <CarouselNext variant="outline" className="relative inset-auto translate-y-0 h-8 w-8 bg-card/50" />
        </div>
      </Carousel>
    </section>
  );
}