import { ViewAllTransactions } from './client';
import { getAllTransaction } from './action';
import { getWalletData } from '../../home/action';
import { getUser } from '@/lib/auth/get-user';
import { redirect } from 'next/navigation';

export default async function TransactionsPage() {
  const user = await getUser();

  if (!user || !user.id) {
    redirect('/login');
  }

  const [transactions, wallets] = await Promise.all([
    getAllTransaction(user.id),
    getWalletData(user.id)
  ]);

  return <ViewAllTransactions transactions={transactions} wallets={wallets} user={user} />;
}