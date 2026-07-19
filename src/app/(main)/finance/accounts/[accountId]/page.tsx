import { AccountStatement } from '@/components/expenses/AccountDetails/AccountStatement';
import { getWalletId } from './action';
import { getUser } from '@/lib/auth/get-user';

export default async function AccountDetailsPage({ params }: { params: Promise<{ accountId: string }> }) {
  const { accountId } = await params;

  const user = await getUser();
  if (!user || !user.id) throw new Error('Unauthorized or invalid user ID');

  const walletData = await getWalletId(user.id, accountId);

  console.log(walletData)

  return (
      <AccountStatement accountData={walletData} />
  );
}
