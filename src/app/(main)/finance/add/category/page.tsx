export const instant = false;
import { getUser } from '@/lib/auth/get-user'
import { redirect } from 'next/navigation'
import PageComponent from '@/components/Shared/PageComponent'
import { AddCategoryForm } from '@/components/Modals/AddCategory/AddCategoryForm'
import { PageHeader } from '@/components/Shared/PageHeader'

export default async function AddCategoryPage() {
  const user = await getUser()
  if (!user || !user.id) redirect('/login')

  return (
    <PageComponent>
      < PageHeader title="Add Category" />
      <AddCategoryForm />
    </PageComponent>
  )
}
