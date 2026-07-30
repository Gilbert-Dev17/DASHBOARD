import { redirect } from 'next/navigation'
import { getUser } from '@/lib/auth/get-user'
import ProfileClientPage from './client'
import { getProfileSystemMetrics } from './action'

export default async function ProfilePage() {
  const user = await getUser()

  if (!user || !user.id) {
    redirect('/login');
  }

  const { dbSize, tableCounts } = await getProfileSystemMetrics()

  return (
    <ProfileClientPage
      user={user}
      dbSize={dbSize}
      tableCounts={tableCounts}
    />
  )
}