'use client';

import React, { useMemo } from 'react';
import { TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { WalletHistory, WalletSummary, TransactionHistory } from '@/types/expenses';
import { formatCurrency, formatSignedCurrency, formatCompactCurrency } from '@/utils/currency';
import { calculateFinancialTotals } from '@/utils/financial';
import { Card, CardContent} from '../ui/card';
import { Area, AreaChart, XAxis, YAxis } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from '@/components/ui/chart';
import { buildNetWorthTrend, getTrendDirection, TREND_COLORS } from '@/lib/finance/net-worth-trend';
import { Separator } from '../ui/separator';
import { CurrencySwitcher } from '@/components/Shared/CurrencySwitcher'

interface SummaryExpenseProps {
  wallets: WalletSummary[];
  historicalSnapshots?: WalletHistory[];
  transactions: TransactionHistory[];
  activeCurrency: string;
  setActiveCurrency: (currency: string) => void;
  availableCurrencies: string[]
}

export const SummaryExpense = ({
  wallets,
  historicalSnapshots = [],
  transactions = [],
  activeCurrency,
  setActiveCurrency,
  availableCurrencies
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
            className="flex flex-col md:flex-col items-stretch p- shadow-vercel rounded-md overflow-hidden bg-transparent"
          >
            <div className="flex flex-col gap-4 p-4 ml-4 shrink-0 min-w-70">
              <div className='flex flex-row items-center justify-between'>
                <div className="flex gap-5 items-baseline">
                  <div
                    className={`text-3xl md:text-4xl font-mono tracking-tight tabular-nums flex items-baseline gap-1 ${
                      isNegative ? 'text-rose-400' : 'text-foreground'
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
                        <span className="flex items-center gap-1.5 text-xs font-medium text-emerald-500">
                          <TrendingUp size={12} /> {trendPercentage}%
                        </span>
                        From last month&apos;s snapshots.
                      </span>
                    ) : (
                      <span className="inline-flex items-center flex-wrap gap-x-1.5">
                        <span className="flex items-center gap-1.5 text-xs font-medium text-rose-500">
                          <TrendingDown size={12} /> {Math.abs(trendPercentage)}%
                        </span>
                        From last month&apos;s snapshots.
                      </span>
                    )}
                  </p>
                </div>

                <CurrencySwitcher
                    currencies={availableCurrencies}
                    activeCurrency={activeCurrency}
                    onCurrencyChange={setActiveCurrency}
                  />

              </div>
            </div>

            <div className="w-full flex flex-col relative md:min-h-0 h-32">
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
                    padding={{ left: 16, right: 0 }}
                    interval={0}
                    fontSize={10}
                    tickFormatter={(value) => value}
                  />
                  <YAxis
                    yAxisId="left"
                    orientation="left"
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => formatCompactCurrency(value, currency)}
                    fontSize={10}
                    domain={['auto', 'auto']}
                    width={45}
                  />
                  <YAxis
                    yAxisId="right"
                    orientation="right"
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => formatCompactCurrency(value, currency)}
                    fontSize={10}
                    domain={['auto', 'auto']}
                    width={45}
                  />
                  <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
                  <Area
                    dataKey="value"
                    yAxisId="left"
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
    <Card className="flex flex-col shrink-0 bg-card shadow-vercel rounded-md text-card-foreground">
      <CardContent className="flex flex-col gap-4">
        {summaryItems.map((item, index) => (
          <React.Fragment key={item.label}>
            <div className="flex flex-row gap-2 justify-between">
              <div className="flex items-center gap-2">
                <div className={`w-6 h-6 rounded-full ${item.bgClass} flex items-center justify-center shrink-0`}>
                  {item.icon}
                </div>
                <p className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">{item.label}</p>
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
