const LOCALE_MAP: Record<string, string> = {
  PHP: 'en-PH',
  USD: 'en-US',
  EUR: 'en-IE',
  GBP: 'en-GB',
  JPY: 'ja-JP',
  // Fallback to en-US for others, or could use undefined for browser default
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
