import ExpenseTrackerPage from '@/components/expenses/expensesPage'
import { getMonthlyTransactions, getExpenseCategories, getFinancialSummary } from './action'
import { getHistoricalSnapshots, getWalletData } from '../home/action'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function page() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/logIn');
  }

  const [ wallets, historicalSnapshots, categories, summary, transactions ] = await Promise.all([
    getWalletData(user.id),
    getHistoricalSnapshots(user.id),
    getExpenseCategories(user.id),
    getFinancialSummary(user.id),
    getMonthlyTransactions(user.id)
  ]);


  return (
    <ExpenseTrackerPage
      historicalSnapshots={historicalSnapshots}
      summary={summary}
      categories={categories}
      transactions={transactions}
      wallets={wallets}
    />
  )
}
