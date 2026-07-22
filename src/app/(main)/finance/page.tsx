import ExpenseTrackerPage from './client'
import { getMonthlyTransactions, getExpenseCategories } from './action'
import { getHistoricalSnapshots, getWalletData } from '../home/action'
import { getUser } from '@/lib/auth/get-user'
import { redirect } from 'next/navigation'

export default async function page() {
  const user = await getUser()

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
      user={user}
      historicalSnapshots={historicalSnapshots}
      transactions={transactions}
      wallets={wallets}
      allCategories={allCategories}
    />
  )
}
