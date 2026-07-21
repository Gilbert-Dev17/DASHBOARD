import { TransactionType } from "@/types/database";

interface SignableTransaction {
  amount: number; // always stored as a positive magnitude
  transaction_type: TransactionType;
  wallet_id: string;
  to_wallet_id: string | null;
}

export const getSignedAmount = (
  txn: SignableTransaction,
  perspectiveWalletId: string
): number => {
  const magnitude = Math.abs(txn.amount);

  switch (txn.transaction_type) {
    case 'income':
      return magnitude;
    case 'expense':
      return -magnitude;
    case 'transfer':
      return txn.wallet_id === perspectiveWalletId ? -magnitude : magnitude;
    default:
      return magnitude;
  }
};

const LOCALE_MAP: Record<string, string> = {
  PHP: 'en-PH',
  USD: 'en-US',
  EUR: 'en-IE',
  GBP: 'en-GB',
  JPY: 'ja-JP',
}

export const formatCurrency = (amount: number, currencyCode: string = 'PHP'): string => {
  const locale = LOCALE_MAP[currencyCode] || undefined;
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currencyCode,
  }).format(amount);
};

export const formatSignedCurrency = (amount: number, currencyCode: string = 'PHP', forceSign: boolean = false): string => {
  const formatted = formatCurrency(Math.abs(amount), currencyCode);
  if (amount < 0) return `-${formatted}`;
  if (amount > 0 && forceSign) return `+${formatted}`;
  return formatted;
}

export const formatInputAmount = (value: string): string => {
  if (!value) return ''
  const parts = value.split('.')
  const integerPart = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',')
  return parts.length > 1 ? `${integerPart}.${parts[1]}` : integerPart
}
