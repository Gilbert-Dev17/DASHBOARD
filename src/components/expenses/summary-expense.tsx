'use client';

import React, { useMemo } from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { WalletHistory, WalletSummary, TransactionHistory } from '@/types/expenses';
import { formatCurrency, formatSignedCurrency } from '@/utils/currency';
import { calculateFinancialTotals } from '@/utils/financial';
import { Card, CardTitle, CardContent, CardHeader } from '../ui/card';
import { Badge } from '../ui/badge';
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from '@/components/ui/chart';
import { buildNetWorthTrend, getTrendDirection, TREND_COLORS } from '@/lib/finance/net-worth-trend';

interface SummaryExpenseProps {
  wallets: WalletSummary[];
  historicalSnapshots?: WalletHistory[];
  transactions: TransactionHistory[];
}

export const SummaryExpense = ({
  wallets,
  historicalSnapshots = [],
  transactions = [],
}: SummaryExpenseProps) => {
  const totalsByCurrency = calculateFinancialTotals(wallets, historicalSnapshots, transactions);
  const currencyBlocks = Object.values(totalsByCurrency);

  const trendsByCurrency = useMemo(() => {
    const map: Record<string, ReturnType<typeof buildNetWorthTrend>> = {};
    currencyBlocks.forEach((totals) => {
      map[totals.currency] = buildNetWorthTrend(
        wallets,
        historicalSnapshots,
        totals.currency,
        totals.netWorth
      );
    });
    return map;
  }, [wallets, historicalSnapshots, currencyBlocks]);

  return (
    <React.Fragment>
      {currencyBlocks.map((totals) => {
        const { netWorth, trendPercentage, currency } = totals;
        const [nwDollars, nwCents] = formatSignedCurrency(netWorth, currency).split('.');
        const isNegative = netWorth < 0;

        const direction = getTrendDirection(trendPercentage);
        const trendColor = TREND_COLORS[direction];
        const chartData = trendsByCurrency[currency] ?? [];
        const hasEnoughHistory = chartData.length >= 2;

        const chartConfig = {
          value: { label: 'Net Worth', color: trendColor },
        } satisfies ChartConfig;

        return (
          <section
            key={currency}
            aria-label={`Financial Summary for ${currency}`}
            className="flex flex-col xl:flex-row xl:items-center justify-between gap-8 xl:gap-12"
          >
            <Card className="w-full">
              <CardContent className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                <div className="flex flex-col gap-4">
                <div>
                  <CardTitle
                    id={`finances-heading-${currency}`}
                    className="text-xs font-semibold uppercase tracking-[0.2em] text-foreground"
                  >
                    <div className="flex flex-row items-center gap-4">
                      Net Worth ({currency})
                      {trendPercentage !== null && (
                        <Badge
                          className="flex items-center px-3 py-1 rounded-full text-[10px] font-medium"
                          style={{ backgroundColor: `${trendColor}1A`, color: trendColor }}
                        >
                          {direction === 'up' && <TrendingUp size={12} />}
                          {direction === 'down' && <TrendingDown size={12} />}
                          {direction === 'flat' && <Minus size={12} />}
                          {trendPercentage > 0 ? '+' : ''}
                          {trendPercentage}%
                        </Badge>
                      )}
                    </div>
                  </CardTitle>
                </div>

                  <div
                    className={`text-5xl md:text-6xl font-mono tracking-tighter tabular-nums flex items-baseline gap-1 ${
                      isNegative ? 'text-rose-400' : 'text-accent'
                    }`}
                  >
                    {nwDollars}
                    {nwCents && <span className="text-2xl md:text-3xl text-muted-foreground">.{nwCents}</span>}
                  </div>

                  <p className="text-xs lg:text-sm text-muted-foreground font-medium max-w-sm">
                    {trendPercentage === null
                      ? 'Waiting for 30 days of data to calculate your first trend.'
                      : direction === 'flat'
                        ? "No change from last month's snapshots."
                        : direction === 'up'
                          ? `Up ${trendPercentage}% from last month's snapshots.`
                          : `Down ${Math.abs(trendPercentage)}% from last month's snapshots.`}
                  </p>
                </div>

                <div className="w-full h-24 lg:h-32">
                  {hasEnoughHistory ? (
                    <ChartContainer config={chartConfig} className="w-full h-full">
                      <LineChart
                        accessibilityLayer
                        data={chartData}
                        margin={{ left: 12, right: 12, top: 12, bottom: 12 }}
                      >
                        <CartesianGrid vertical={false} opacity={0.3} />
                        <XAxis
                          dataKey="label"
                          tickLine={false}
                          axisLine={false}
                          tickMargin={8}
                          fontSize={10}
                        />
                        <YAxis hide domain={['auto', 'auto']} />
                        <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
                        <Line
                          dataKey="value"
                          type="step"
                          stroke={trendColor}
                          strokeWidth={3}
                          dot={{ r: 4, strokeWidth: 2, fill: 'var(--background)' }}
                          activeDot={{ r: 6 }}
                          isAnimationActive={false}
                        />
                      </LineChart>
                    </ChartContainer>
                  ) : (
                    <div className="flex h-full w-full items-center justify-center rounded-md border border-dashed border-border/50 text-[10px] uppercase tracking-wider text-muted-foreground/60">
                      Trend appears after your next snapshot
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </section>
        );
      })}
    </React.Fragment>
  );
};
