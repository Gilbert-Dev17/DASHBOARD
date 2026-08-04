import DashboardPage from './client';
import { getHomeData } from './action'
import { getUser } from '@/lib/auth/get-user'
import { redirect } from 'next/navigation'

export default async function page() {

  const user = await getUser();

  if (!user || !user.id) {
    redirect('/login');
  }

  const tasks = await getHomeData(user.id);

  return (
    <DashboardPage initialTasks={tasks} user={user} />
  )
}