import React from 'react'
import { ArrowDownLeft, ArrowUpRight, TrendingUp, TrendingDown } from 'lucide-react'
import { Separator } from '@/components/ui/separator'
import { FinancialSummary } from '@/types/expenses'

interface SummaryExpenseProps {
  summary: FinancialSummary & { trend?: number };
  balanceMain: string;
  balanceCents: string;
  incomeMain: string;
  incomeCents: string;
  expenseMain: string;
  expenseCents: string;
}

export const SummaryExpense = ({ summary, balanceMain, balanceCents, incomeMain, incomeCents, expenseMain, expenseCents }: SummaryExpenseProps) => {
  return (
    <section aria-label="Financial Summary" className="flex flex-col xl:flex-row xl:items-center justify-between gap-8 xl:gap-12 mb-8 pb-8 border-b border-dashed border-border/50">
        {/* Left Side: Net Worth */}
        <div className="flex flex-col">
          <div className="flex items-center gap-4 mb-4">
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Net Worth</span>
            {summary.trend !== undefined && (
              <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-medium ${
                summary.trend >= 0 ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'
              }`}>
                {summary.trend >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                {summary.trend > 0 ? '+' : ''}{summary.trend}%
              </div>
            )}
          </div>
          <div className="text-5xl md:text-6xl lg:text-[6rem] leading-none font-mono tracking-tighter tabular-nums flex items-baseline mb-4">
            {balanceMain}<span className="text-3xl md:text-4xl lg:text-5xl text-muted-foreground/40">.{balanceCents}</span>
          </div>
          <p className="text-xs lg:text-sm text-muted-foreground/70 max-w-sm font-medium">
            {summary.trend && summary.trend >= 0
              ? `Up ${summary.trend}% from last month, driven by recent Income.`
              : `Down ${Math.abs(summary.trend || 0)}% from last month, driven by recent Expenses.`}
          </p>
        </div>

        {/* Vertical Separator */}
        <Separator orientation='vertical' className="hidden xl:block w-px self-stretch bg-border/50 opacity-60" />

        {/* Right Side: Income & Expense */}
        <div className="flex flex-row items-center gap-8 sm:gap-16 w-full xl:w-auto">
           {/* Income */}
           <div className="flex flex-col gap-3">
             <div className="flex items-center gap-2">
               <ArrowDownLeft size={16} className="text-emerald-500" />
               <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">
                 Income
               </span>
             </div>
             <div className="text-4xl lg:text-5xl font-mono text-emerald-500 tabular-nums tracking-tight flex items-baseline">
               +{incomeMain}<span className="text-lg lg:text-2xl opacity-60">.{incomeCents}</span>
             </div>
           </div>

           {/* Expense */}
           <div className="flex flex-col gap-3">
             <div className="flex items-center gap-2">
               <ArrowUpRight size={16} className="text-rose-500" />
               <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">
                 Expense
               </span>
             </div>
             <div className="text-4xl lg:text-5xl font-mono text-rose-500 tabular-nums tracking-tight flex items-baseline">
               -{expenseMain}<span className="text-lg lg:text-2xl opacity-60">.{expenseCents}</span>
             </div>
           </div>
        </div>
      </section>
  )
}
