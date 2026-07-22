'use client'

import PageComponent from '@/components/shared/PageComponent'
import { TransactionHistory } from '@/types/expenses'
import type { WalletSummary, UserSummary } from '@/types/dashboard'
import { WalletGrid } from '@/components/expenses/accounts-Grid'
import { SummaryExpense, IncomeExpenseCard } from '@/components/expenses/summary-expense'
import { CategorySection } from '@/components/expenses/category-section'
import { RecentLogsSection } from '@/components/expenses/recent-Logs'
import { WalletSnapshot, ExpenseCategory } from '@/types/database'
import { HeaderTitle } from '@/components/shared/HeaderTitle'
import { CurrencySwitcher } from '@/components/shared/CurrencySwitcher'
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

  // const filteredCategories = useMemo(() => allCategories.filter(c => (c.currency || 'PHP') === activeCurrency), [allCategories, activeCurrency]);

  return (
    <PageComponent>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
        <HeaderTitle title='Finance' desc=''/>
        <CurrencySwitcher
          currencies={availableCurrencies}
          activeCurrency={activeCurrency}
          onCurrencyChange={setActiveCurrency}
        />
      </div>

      <SummaryExpense
        wallets={filteredWallets}
        historicalSnapshots={historicalSnapshots}
        transactions={filteredTransactions}
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6">
        <div className="lg:col-span-8 flex flex-col gap-6 min-w-0">
          <WalletGrid wallets={filteredWallets} />

          <CategorySection transactions={filteredTransactions} allCategories={allCategories} currency={activeCurrency} />
        </div>

        <div className="lg:col-span-4 flex flex-col gap-6">
          <IncomeExpenseCard transactions={filteredTransactions} currency={activeCurrency} />
          <RecentLogsSection transactions={filteredTransactions} />
        </div>
      </div>
    </PageComponent>
  )
}