import { ArrowDown, ArrowUp, ArrowRightLeft, Scale } from 'lucide-react';
import { TransactionType } from '@/types/database';

interface TransactionIconProps {
  type: TransactionType;
}

export function TransactionIcon({ type }: TransactionIconProps) {
  let Icon = ArrowDown;
  let iconColor = 'text-rose-500';
  let iconBg = 'bg-rose-500/10';

  if (type === 'transfer') {
    Icon = ArrowRightLeft;
    iconColor = 'text-yellow-500';
    iconBg = 'bg-yellow-500/10';
  } else if (type === 'income') {
    Icon = ArrowUp;
    iconColor = 'text-emerald-500';
    iconBg = 'bg-emerald-500/10';
  } else if (type === 'adjustment') {
    Icon = Scale;
    iconColor = 'text-blue-500';
    iconBg = 'bg-blue-500/10';
  }

  return (
    <div className={`h-8 w-8 rounded-full flex items-center justify-center ${iconBg} ${iconColor}`}>
      <Icon size={14} strokeWidth={2.5} />
    </div>
  );
}
