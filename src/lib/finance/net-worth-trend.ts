import type { WalletHistory, WalletSummary } from '@/types/expenses';

export interface NetWorthTrendPoint {
  key: string;   // "2026-01" or "now"
  label: string; // "Jan" or "Jan '25" or "Now"
  value: number;
}

const ASSET_TYPES = ['Debit', 'Assets', 'Stocks', 'Crypto'];
const LIABILITY_TYPES = ['Credit', 'Loans'];

function monthKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

function monthLabel(key: string, includeYear: boolean): string {
  const [year, month] = key.split('-').map(Number);
  const short = new Date(year, month - 1, 1).toLocaleString('default', { month: 'short' });
  return includeYear ? `${short} '${String(year).slice(2)}` : short;
}

/**
 * Builds a chronological net-worth trend from wallet snapshots, carrying each
 * wallet's last known balance forward across any months it wasn't snapshotted in
 * (expected given lazy snapshot-on-session-load), and appends a live "Now" point
 * using the current calculated net worth rather than a stale snapshot.
 *
 * Returns an empty array when there isn't enough history to plot honestly —
 * callers should render a "not enough data yet" state rather than a fabricated line.
 */
export function buildNetWorthTrend(
  wallets: WalletSummary[],
  historicalSnapshots: WalletHistory[],
  currency: string,
  currentNetWorth: number
): NetWorthTrendPoint[] {
  const relevant = historicalSnapshots
    .filter((s) => {
      const wallet = wallets.find((w) => w.id === s.wallet_id);
      return wallet && (wallet.currency || 'PHP') === currency;
    })
    .sort((a, b) => new Date(a.recorded_at).getTime() - new Date(b.recorded_at).getTime());

  if (relevant.length === 0) return [];

  const latestBalanceByWallet = new Map<string, number>();
  const monthOrder: string[] = [];
  const monthTotals = new Map<string, number>();

  const finalizeMonth = (key: string) => {
    if (!monthTotals.has(key)) monthOrder.push(key);
    let total = 0;
    latestBalanceByWallet.forEach((balance, walletId) => {
      const wallet = wallets.find((w) => w.id === walletId);
      if (!wallet) return;
      if (ASSET_TYPES.includes(wallet.type)) total += balance;
      if (LIABILITY_TYPES.includes(wallet.type)) total -= balance;
    });
    monthTotals.set(key, total);
  };

  let cursorMonth: string | null = null;
  for (const snap of relevant) {
    const key = monthKey(new Date(snap.recorded_at));
    if (cursorMonth !== null && key !== cursorMonth) finalizeMonth(cursorMonth);
    latestBalanceByWallet.set(snap.wallet_id, snap.balance);
    cursorMonth = key;
  }
  if (cursorMonth) finalizeMonth(cursorMonth);

  const spansMultipleYears = new Set(monthOrder.map((k) => k.split('-')[0])).size > 1;

  const historical = monthOrder.map((key) => ({
    key,
    label: monthLabel(key, spansMultipleYears),
    value: monthTotals.get(key)!,
  }));

  // Replace the current month's point with the live figure instead of appending a duplicate.
  const currentKey = monthKey(new Date());
  const withoutCurrentMonth = historical.filter((p) => p.key !== currentKey);

  return [...withoutCurrentMonth, { key: currentKey, label: 'Now', value: currentNetWorth }];
}

export type TrendDirection = 'up' | 'down' | 'flat' | 'unknown';

export function getTrendDirection(trendPercentage: number | null): TrendDirection {
  if (trendPercentage === null) return 'unknown';
  if (trendPercentage > 0) return 'up';
  if (trendPercentage < 0) return 'down';
  return 'flat';
}

export const TREND_COLORS: Record<TrendDirection, string> = {
  up: '#34d399',
  down: '#fb7185',
  flat: '#9ca3af',
  unknown: '#9ca3af',
};
