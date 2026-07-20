import ExpenseTrackerPage from '@/components/expenses/expensesPage'
import { getMonthlyTransactions, getExpenseCategories } from './action'
import { getHistoricalSnapshots, getWalletData } from '../home/action'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function page() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user || !user.id) {
    redirect('/login');
  }

  const [ wallets, historicalSnapshots, transactions, allCategories ] = await Promise.all([
    getWalletData(user.id),
    getHistoricalSnapshots(user.id),
    getMonthlyTransactions(user.id),
    getExpenseCategories(user.id)
  ]);


  return (
    <ExpenseTrackerPage
      historicalSnapshots={historicalSnapshots}
      transactions={transactions}
      wallets={wallets}
      allCategories={allCategories}
    />
  )
}
