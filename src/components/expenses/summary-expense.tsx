'use client';

import React, { useMemo } from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { WalletHistory, WalletSummary, TransactionHistory } from '@/types/expenses';
import { formatCurrency, formatSignedCurrency } from '@/utils/currency';
import { calculateFinancialTotals } from '@/utils/financial';
import { Card, CardTitle, CardContent, CardFooter } from '../ui/card';
import { Bar, BarChart, XAxis, YAxis } from 'recharts';
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
              <CardContent className="flex flex-col md:flex-row items-start md:items-center gap-8 lg:gap-16">
                <div className="flex flex-col gap-4 shrink-0">
                  <div>
                    <CardTitle
                      id={`finances-heading-${currency}`}
                      className="text-xs font-semibold uppercase tracking-[0.2em] text-foreground"
                    >
                      Net Worth ({currency})
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

                  <p className="text-xs lg:text-sm text-muted-foreground font-medium max-w-sm leading-relaxed">
                    {trendPercentage === null ? (
                      'Waiting for a day of data to calculate your first trend.'
                    ) : direction === 'up' ? (
                      <span className="inline-flex items-center flex-wrap gap-x-1.5">
                        Up
                        <span className="flex items-center gap-1.5 text-[10px] font-medium text-emerald-500">
                          <TrendingUp size={12} /> {trendPercentage}%
                        </span>
                        from last month's snapshots.
                      </span>
                    ) : (
                      <span className="inline-flex items-center flex-wrap gap-x-1.5">
                        Down
                        <span className="flex items-center gap-1.5 text-[10px] font-medium text-rose-500">
                          <TrendingDown size={12} /> {Math.abs(trendPercentage)}%
                        </span>
                        from last month's snapshots.
                      </span>
                    )}
                  </p>
                </div>

                <div className="w-full h-24 lg:h-32 flex-1 -mb-5 lg:-mb-6">
                  {hasEnoughHistory ? (
                    <ChartContainer config={chartConfig} className="w-full h-full p-0 m-0">
                      <BarChart
                        accessibilityLayer
                        data={chartData}
                        margin={{ top: 0, right: 0, left: 0, bottom: 0 }}
                      >
                        <XAxis
                          dataKey="label"
                          tickLine={false}
                          axisLine={false}
                          tickMargin={2}
                          fontSize={10}
                          tickFormatter={(value) => typeof value === 'string' ? value.slice(0, 3) : value}
                        />
                        <YAxis hide domain={['auto', 'auto']} />
                        <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
                        <Bar
                          dataKey="value"
                          fill={trendColor}
                          radius={2}
                          isAnimationActive={true}
                        />
                      </BarChart>
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
