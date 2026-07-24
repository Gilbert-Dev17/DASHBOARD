import { AccountStatement } from './client';
import { getWalletId } from './action';
import { getUser } from '@/lib/auth/get-user';
import { redirect } from 'next/navigation';

export default async function AccountDetailsPage({ params }: { params: Promise<{ accountId: string }> }) {
  const { accountId } = await params;

  const user = await getUser();
  if (!user || !user.id) {
    redirect('/login');
  }

  const walletData = await getWalletId(user.id, accountId);

  if (!walletData) {
    redirect('/finance');
  }

  return (
      <AccountStatement accountData={walletData} />
  );
}
