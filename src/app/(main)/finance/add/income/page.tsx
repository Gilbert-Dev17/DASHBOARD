export const instant = false;
import { getUser } from '@/lib/auth/get-user'
import { redirect } from 'next/navigation'
import PageComponent from '@/components/Shared/PageComponent'
import { IncomeForm } from '@/components/Modals/AddTransaction/IncomeForm'

export default async function AddIncomePage() {
  const user = await getUser()
  if (!user || !user.id) redirect('/login')

  return (
    <PageComponent>
      <IncomeForm />
    </PageComponent>
  )
}
