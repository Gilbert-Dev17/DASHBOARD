'use client'

import PageComponent from '@/components/Shared/PageComponent'
import { TransactionHistory } from '@/types/expenses'
import type { WalletSummary, UserSummary } from '@/types/dashboard'
import { WalletGrid } from '@/components/Expenses/WalletGrid'
import { SummaryExpense, IncomeExpenseCard } from '@/components/Expenses/SummaryExpense'
import { CategorySection } from '@/components/Expenses/CategorySection'
import { RecentLogsSection } from '@/components/Expenses/RecentLogsSection'
import { WalletSnapshot, ExpenseCategory } from '@/types/database'
import { CurrencySwitcher } from '@/components/Shared/CurrencySwitcher'
import { useCurrencyFilter } from '@/hooks/useCurrencyFilter'

interface ExpenseTrackerProps {
  user?: UserSummary;
  transactions: TransactionHistory[];
  wallets: WalletSummary[]
  historicalSnapshots?: WalletSnapshot[];
  allCategories: ExpenseCategory[];
}

export default function ExpenseTrackerPage({ user, wallets, transactions, historicalSnapshots, allCategories }: ExpenseTrackerProps) {

  const { availableCurrencies, activeCurrency, setActiveCurrency, filteredWallets, filteredTransactions } = useCurrencyFilter({ wallets, user, transactions });

  return (
    <PageComponent>
      {/* <div className="flex justify-end mb-4">
        <CurrencySwitcher
          currencies={availableCurrencies}
          activeCurrency={activeCurrency}
          onCurrencyChange={setActiveCurrency}
        />
      </div> */}

      <div className="flex flex-col gap-4">
        <SummaryExpense
          wallets={filteredWallets}
          historicalSnapshots={historicalSnapshots}
          transactions={filteredTransactions}
          activeCurrency={activeCurrency}
          availableCurrencies={availableCurrencies}
          setActiveCurrency={setActiveCurrency}
        />

        <div className="block lg:hidden">
          <IncomeExpenseCard transactions={filteredTransactions} currency={activeCurrency} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 mt-4">
        <div className="lg:col-span-8 flex flex-col gap-4 min-w-0">
          <WalletGrid wallets={filteredWallets} transactions={filteredTransactions} />

          <CategorySection transactions={filteredTransactions} allCategories={allCategories} currency={activeCurrency} />
        </div>

        <div className="lg:col-span-4 flex flex-col gap-4">
          <div className="hidden lg:block">
            <IncomeExpenseCard transactions={filteredTransactions} currency={activeCurrency} />
          </div>

          <RecentLogsSection transactions={filteredTransactions} />
        </div>
      </div>
    </PageComponent>
  )
}