export const instant = false;
import { getUser } from '@/lib/auth/get-user'
import { redirect } from 'next/navigation'
import PageComponent from '@/components/Shared/PageComponent'
import {ExpenseForm} from "@/components/Modals/AddTransaction/ExpenseForm";

export default async function AddExpensePage() {
  const user = await getUser()
  if (!user || !user.id) redirect('/login')

  return (
    <PageComponent>
      <ExpenseForm />
    </PageComponent>
  )
}
