export const instant = false;
import { getUser } from '@/lib/auth/get-user'
import { redirect } from 'next/navigation'
import PageComponent from '@/components/Shared/PageComponent'
import { TransferForm } from '@/components/Modals/AddTransaction/TransferForm'

export default async function AddTransferPage() {
  const user = await getUser()
  if (!user || !user.id) redirect('/login')

  return (
    <PageComponent>
      <TransferForm />
    </PageComponent>
  )
}
