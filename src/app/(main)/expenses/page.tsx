import ExpenseTrackerPage from '@/components/expenses/expensesPage'
import { getMonthlyTransactions } from './action'
import { getHistoricalSnapshots, getWalletData } from '../home/action'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function page() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/logIn');
  }

  const [ wallets, historicalSnapshots, transactions ] = await Promise.all([
    getWalletData(user.id),
    getHistoricalSnapshots(user.id),
    getMonthlyTransactions(user.id)
  ]);


  return (
    <ExpenseTrackerPage
      historicalSnapshots={historicalSnapshots}
      transactions={transactions}
      wallets={wallets}
    />
  )
}
