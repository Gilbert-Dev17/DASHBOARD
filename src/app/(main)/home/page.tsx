import DashboardPage from '@/components/home/dashboard'
import { getHomeData, getWalletData} from './action'
import { getUser } from '@/lib/auth/get-user'
import { redirect } from 'next/navigation'

export default async function page() {

  const user = await getUser();

  if (!user) {
    redirect('/login');
  }

  const [tasks, wallet]= await Promise.all([
    getHomeData(user.id),
    getWalletData(user.id)
  ])

  return (
    <DashboardPage initialTasks={tasks} wallets={wallet} user={user} />
  )
}