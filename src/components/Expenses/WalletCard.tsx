import Link from 'next/link';
import type { LucideIcon } from 'lucide-react';
import { Wallet as WalletIcon, CreditCard } from 'lucide-react';
import { Card, CardHeader, CardContent, CardTitle} from '@/components/ui/card';
import { formatCurrency } from '@/utils/currency';
import { withAlpha } from '@/utils/color';
import { AVAILABLE_ICONS } from '@/lib/constants/categories';
import type { WalletSummary } from '@/types/dashboard';

interface WalletCardProps {
  wallet: WalletSummary;
}

function getAmountFontSize(formatted: string) {
  const len = formatted.length;
  if (len > 14) return 'text-base';
  if (len > 11) return 'text-lg';
  if (len > 9) return 'text-xl';
  return 'text-2xl';
}

export function WalletCard({ wallet }: WalletCardProps) {
  const isLiability = wallet.type === 'Credit' || wallet.type === 'Loans';
  const iconEntry = AVAILABLE_ICONS.find((i) => i.name === wallet.icon);
  const Icon: LucideIcon = iconEntry?.icon ?? (isLiability ? CreditCard : WalletIcon);
  const color = wallet.color || (isLiability ? '#ef4444' : '#9ca3af');
  const isNegative = wallet.balance < 0;

  const formattedBalance = formatCurrency(wallet.balance, wallet.currency);

  return (
    <div
      className="group block h-full rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      aria-label={`${wallet.name}, ${wallet.type} account in ${wallet.currency}, balance ${formatCurrency(wallet.balance, wallet.currency)}`}
    >
      <Card
        className="relative h-full flex flex-col justify-between py-4 overflow-hidden ring-0 bg-card/60 backdrop-blur-sm rounded-md"
      >
        {/* accent rail */}
        {/* <span
          className="absolute inset-y-0 left-0 w-0.75"
          style={{ backgroundColor: color }}
          aria-hidden="true"
        /> */}

        <CardHeader className="flex flex-row flex-wrap justify-between items-center gap-x-4 min-w-0">
          <div className='flex flex-row items-center gap-2'>
            <div
              className="flex h-12 w-18 shrink-0 items-center justify-center rounded-md
                         shadow-sm transition-transform duration-200"
              style={{ backgroundColor: withAlpha(color, 0.15), color }}
            >
              <Icon size={16} strokeWidth={2} />
            </div>

            <CardTitle className="min-w-0">
              <p className="truncate text-sm font-medium text-foreground/90">{wallet.name}</p>
              <p className="text-xs uppercase tracking-wider text-muted-foreground">
                {wallet.type} &bull; {wallet.currency}
              </p>
            </CardTitle>
          </div>

          <div
              className={`font-mono ${getAmountFontSize(formattedBalance)} tabular-nums tracking-tight shrink-0 leading-tight ${
                isNegative ? 'text-red-400' : 'text-foreground'
              }`}
            >
              {formattedBalance}
            </div>
        </CardHeader>
      </Card>
    </div>
  );
}