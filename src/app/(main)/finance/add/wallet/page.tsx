export const instant = false;
import { getUser } from '@/lib/auth/get-user'
import { redirect } from 'next/navigation'
import PageComponent from '@/components/Shared/PageComponent'
import { AddWalletForm } from '@/components/Modals/AddWallet/AddWalletForm'
import { PageHeader } from '@/components/Shared/PageHeader';

export default async function AddWalletPage() {
  const user = await getUser()
  if (!user || !user.id) redirect('/login')

  return (
    <PageComponent>
      < PageHeader title="Add Category" />
      <AddWalletForm />
    </PageComponent>
  )
}
