import { redirect } from 'next/navigation'
import { getUser } from '@/lib/auth/get-user'
import PageComponent from '@/components/shared/PageComponent'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { ProfileSettings } from '@/components/profile/ProfileSettings'

export default async function ProfilePage() {
  const user = await getUser()

  if (!user || !user.id) {
    redirect('/login');
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
            {/* <p className="text-sm text-muted-foreground mt-2 font-mono">{user.email}</p> */}
          </div>
        </div>
      </header>

      {/* MAIN GRID */}
      <div>

        {/* RIGHT COLUMN: Preferences */}
        <aside className="lg:col-span-5 space-y-16 mt-8 lg:mt-0">
          <ProfileSettings user={user} />
        </aside>

      </div>
    </PageComponent>
  )
}