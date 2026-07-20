import Link from 'next/link';
import type { LucideIcon } from 'lucide-react';
import { Wallet as WalletIcon, CreditCard } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { formatCurrency } from '@/utils/currency';
import { withAlpha } from '@/utils/color';
import { AVAILABLE_ICONS } from '@/lib/constants/categories';
import type { WalletSummary } from '@/types/dashboard';

interface WalletCardProps {
  wallet: WalletSummary;
}

export function WalletCard({ wallet }: WalletCardProps) {
  const isLiability = wallet.type === 'Credit' || wallet.type === 'Loans';
  const iconEntry = AVAILABLE_ICONS.find((i) => i.name === wallet.icon);
  const Icon: LucideIcon = iconEntry?.icon ?? (isLiability ? CreditCard : WalletIcon);
  const color = wallet.color || (isLiability ? '#ef4444' : '#9ca3af');
  const isNegative = wallet.balance < 0;

  return (
    <Link
      href={`/finance/accounts/${wallet.id}`}
      className="group block h-full rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      aria-label={`${wallet.name}, ${wallet.type} account in ${wallet.currency}, balance ${formatCurrency(wallet.balance, wallet.currency)}`}
    >
      <Card
        className="relative h-full flex flex-col justify-between py-5 overflow-hidden
                   border border-border/50 ring-0 bg-card/60 backdrop-blur-sm"
      >
        {/* accent rail */}
        <span
          className="absolute inset-y-0 left-0 w-[3px]"
          style={{ backgroundColor: color }}
          aria-hidden="true"
        />

        <div className="flex items-start justify-between px-5">
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-foreground/90">{wallet.name}</p>
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
              {wallet.type} &bull; {wallet.currency}
            </p>
          </div>

          <div
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full
                       shadow-sm transition-transform duration-200"
            style={{ backgroundColor: withAlpha(color, 0.15), color }}
          >
            <Icon size={16} strokeWidth={2} />
          </div>
        </div>

        <div className="px-5">
          <div
            className={`font-mono text-2xl tabular-nums tracking-tight ${
              isNegative ? 'text-red-400' : 'text-foreground'
            }`}
          >
            {formatCurrency(wallet.balance, wallet.currency)}
          </div>
        </div>
      </Card>
    </Link>
  );
}