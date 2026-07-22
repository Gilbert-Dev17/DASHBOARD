import { ViewAllTransactions } from './client';
import { getAllTransaction } from './action';
import { getUser } from '@/lib/auth/get-user';
import { redirect } from 'next/navigation';

export default async function TransactionsPage() {
  const user = await getUser();

  if (!user || !user.id) {
    redirect('/login');
  }

  const transactions = await getAllTransaction(user.id);

  return <ViewAllTransactions transactions={transactions} />;
}