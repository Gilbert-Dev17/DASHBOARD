'use client';

import React, { useMemo } from 'react';
import { TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { WalletHistory, WalletSummary, TransactionHistory } from '@/types/expenses';
import { formatCurrency, formatSignedCurrency } from '@/utils/currency';
import { calculateFinancialTotals } from '@/utils/financial';
import { Card, CardContent} from '../ui/card';
import { Area, AreaChart, XAxis } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from '@/components/ui/chart';
import { buildNetWorthTrend, getTrendDirection, TREND_COLORS } from '@/lib/finance/net-worth-trend';
import { Separator } from '../ui/separator';

interface SummaryExpenseProps {
  wallets: WalletSummary[];
  historicalSnapshots?: WalletHistory[];
  transactions: TransactionHistory[];
  activeCurrency: string;
}

export const SummaryExpense = ({
  wallets,
  historicalSnapshots = [],
  transactions = [],
  activeCurrency,
}: SummaryExpenseProps) => {
  const totalsByCurrency = calculateFinancialTotals(wallets, historicalSnapshots, transactions, activeCurrency);
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

        const chartConfig = {
          value: { label: 'Net Worth: ', color: trendColor },
        } satisfies ChartConfig;

        return (
          <Card
            key={currency}
            aria-label={`Financial Summary for ${currency}`}
            className="flex flex-col md:flex-row items-stretch p-0 shadow-vercel rounded-xl overflow-hidden"
          >
            <div className="flex flex-col gap-4 p-5 md:p-6 shrink-0 md:border-r border-border min-w-70">
              <div>
                <h3
                  id={`finances-heading-${currency}`}
                  className="text-xs font-semibold uppercase tracking-widest text-foreground"
                >
                  Net Worth ({currency})
                </h3>
              </div>

              <div
                className={`text-4xl md:text-5xl font-mono tracking-tighter tabular-nums flex items-baseline gap-1 ${
                  isNegative ? 'text-rose-400' : 'text-accent'
                }`}
              >
                {nwDollars}
                {nwCents && <span className="text-xl md:text-2xl text-muted-foreground">.{nwCents}</span>}
              </div>

              <p className="text-xs lg:text-sm text-muted-foreground font-medium max-w-sm leading-relaxed">
                {trendPercentage === null ? (
                  'Waiting for a day of data to calculate your first trend.'
                ) : direction === 'up' ? (
                  <span className="inline-flex items-center flex-wrap gap-x-1.5">
                    Up
                    <span className="flex items-center gap-1.5 text-xs font-medium text-emerald-500">
                      <TrendingUp size={12} /> {trendPercentage}%
                    </span>
                    from last month&apos;s snapshots.
                  </span>
                ) : (
                  <span className="inline-flex items-center flex-wrap gap-x-1.5">
                    Down
                    <span className="flex items-center gap-1.5 text-xs font-medium text-rose-500">
                      <TrendingDown size={12} /> {Math.abs(trendPercentage)}%
                    </span>
                    from last month&apos;s snapshots.
                  </span>
                )}
              </p>
            </div>

            <div className="w-full flex-1 flex flex-col relative min-h-[160px] md:min-h-0">
              <ChartContainer config={chartConfig} className="w-full h-full absolute inset-0">
                <AreaChart
                  accessibilityLayer
                  data={chartData}
                  margin={{ top: 16, right: 16, left: 16, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id={`fill-${currency}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={trendColor} stopOpacity={0.3} />
                      <stop offset="95%" stopColor={trendColor} stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <XAxis
                    dataKey="label"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={6}
                    interval={0}
                    fontSize={10}
                    tickFormatter={(value) => typeof value === 'string' ? value.slice(0, 3) : value}
                  />
                  <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
                  <Area
                    dataKey="value"
                    type="monotone"
                    fill={`url(#fill-${currency})`}
                    stroke={trendColor}
                    strokeWidth={1.5}
                    dot={false}
                    isAnimationActive={true}
                  />
                </AreaChart>
              </ChartContainer>
            </div>
          </Card>
        );
      })}
    </React.Fragment>
  );
};

export const IncomeExpenseCard = ({ transactions, currency }: { transactions: TransactionHistory[], currency: string }) => {

  const { income, expense } = useMemo(() => {
    return transactions.reduce(
      (acc, t) => {
        if (t.type === 'income') acc.income += t.amount;
        if (t.type === 'expense') acc.expense += t.amount;
        return acc;
      },
      { income: 0, expense: 0 }
    );
  }, [transactions]);

  const [incDollars, incCents] = formatCurrency(income, currency).split('.');
  const [expDollars, expCents] = formatCurrency(expense, currency).split('.');

  const summaryItems = [
    {
      label: 'Income',
      dollars: incDollars,
      cents: incCents,
      icon: <ArrowUpRight className="w-3.5 h-3.5 text-emerald-500" />,
      bgClass: 'bg-emerald-500/10'
    },
    {
      label: 'Expenses',
      dollars: expDollars,
      cents: expCents,
      icon: <ArrowDownRight className="w-3.5 h-3.5 text-rose-500" />,
      bgClass: 'bg-rose-500/10'
    }
  ];

  return (
    <Card className="flex flex-col shrink-0 bg-card shadow-vercel text-card-foreground">
      <CardContent className="flex flex-col gap-4">
        {summaryItems.map((item, index) => (
          <React.Fragment key={item.label}>
            <div className="flex flex-row gap-2 justify-between">
              <div className="flex items-center gap-2">
                <div className={`w-6 h-6 rounded-full ${item.bgClass} flex items-center justify-center shrink-0`}>
                  {item.icon}
                </div>
                <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">{item.label}</p>
              </div>

              <div className="text-xl md:text-2xl font-mono font-medium text-foreground tracking-tight">
                {item.dollars}
                {item.cents && <span className="text-sm text-muted-foreground">.{item.cents}</span>}
              </div>
            </div>

            {index === 0 && <Separator className=" w-[calc(100%+32px)]" />}
          </React.Fragment>
        ))}
      </CardContent>
    </Card>
  );
};
