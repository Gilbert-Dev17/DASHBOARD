import DashboardPage from '@/components/home/dashboard'
import { getHomeData } from './action'
import { getUser } from '@/lib/auth/get-user'
import { redirect } from 'next/navigation'

export default async function page() {

  const user = await getUser();

  if (!user) {
    redirect('/login');
  }
  const tasks = await getHomeData(user.id);

  return (
    <DashboardPage initialTasks={tasks} user={user} />
  )
}