'use client'

import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'
import PageComponent from '@/components/Shared/PageComponent'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { ProfileSettings } from '@/components/Profile/ProfileSettings'
import { DatabaseMetricsCard } from '@/components/Profile/DatabaseMetricsCard'
import { UserSummary } from '@/types/dashboard'
import { DatabaseMetrics, TableCounts } from '@/types/database'

interface ProfileClientPageProps {
  user: UserSummary
  dbSize: DatabaseMetrics | null
  tableCounts: TableCounts | null
}

export default function ProfileClientPage({ user, dbSize, tableCounts }: ProfileClientPageProps) {
  const router = useRouter()
  const supabase = createClient()

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) {
      toast.error('Failed to sign out')
    } else {
      toast.success('Signed out successfully')
      router.push('/login')
      router.refresh()
    }
  }

  const initials = user.first_name
    ? user.first_name.charAt(0).toUpperCase()
    : user.email?.charAt(0).toUpperCase() || 'U'

  return (
    <PageComponent>
      {/* HEADER */}
      <header className="mb-16 lg:mb-20">
        <div className="flex items-center gap-6 mb-8 lg:mb-12">
          <Avatar className="w-20 h-20 lg:w-24 lg:h-24 border-2 border-border shrink-0">
            <AvatarImage src={user.avatar_url || undefined} alt="Profile" className="object-cover" />
            <AvatarFallback className="text-2xl lg:text-3xl font-light text-muted-foreground">{initials}</AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tighter leading-none flex items-end">
              {user.first_name || user.name?.split(' ')[0] || 'User'}
              <span className="w-2 h-2 md:w-3 md:h-3 rounded-full ml-2 mb-2 md:mb-3 bg-accent" aria-hidden="true" />
            </h1>
          </div>
        </div>
      </header>

      {/* MAIN GRID */}
      <div className="space-y-8">

        {/* Preferences */}
        <div className="space-y-8">
          <ProfileSettings user={user} />
        </div>

        {/* System */}
        {dbSize && tableCounts && (
          <section aria-labelledby="system-heading">
            <h2 id="system-heading" className="text-xs font-semibold uppercase tracking-[0.2em] mb-6 lg:mb-8">
              System
            </h2>
            <DatabaseMetricsCard
              size_mb={dbSize.size_mb}
              size_pretty={dbSize.size_pretty}
              size_bytes={dbSize.size_bytes}
              tableCounts={tableCounts}
            />
          </section>
        )}

        {/* Sign Out */}
        <section className='flex justify-end pt-4'>
          <Button
            variant="link"
            className="text-destructive hover:text-destructive"
            onClick={handleSignOut}
          >
            <LogOut size={16} />
            Sign out
          </Button>
        </section>

      </div>
    </PageComponent>
  )
}
