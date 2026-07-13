import { redirect } from 'next/navigation'
import { getUser } from '@/lib/auth/get-user'
import PageComponent from '@/components/shared/PageComponent'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { ProfileSettings } from '@/components/profile/ProfileSettings'
import { profileStats as stats } from '@/lib/mockData'

export default async function ProfilePage() {
  const user = await getUser()

  if (!user) {
    redirect('/login')
  }

  const initials = user.first_name
    ? user.first_name.charAt(0).toUpperCase()
    : user.email?.charAt(0).toUpperCase() || 'U'



  const [dollars, cents] = `₱${stats.totalExpenses.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`.split('.')

  return (
    <PageComponent>
      {/* HEADER */}
      <header className="mb-16 lg:mb-20">
        <div className="flex items-center gap-6 mb-8 lg:mb-12">
          <Avatar className="w-20 h-20 lg:w-24 lg:h-24 border-2 border-border shrink-0">
            <AvatarImage alt="Profile" className="object-cover" />
            <AvatarFallback className="text-2xl lg:text-3xl font-light text-muted-foreground">{initials}</AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tighter leading-none flex items-end">
              {user.first_name || 'User'}
              <span className="w-2 h-2 md:w-3 md:h-3 rounded-full ml-2 mb-2 md:mb-3 bg-accent" aria-hidden="true" />
            </h1>
            {/* <p className="text-sm text-muted-foreground mt-2 font-mono">{user.email}</p> */}
          </div>
        </div>
      </header>

      {/* MAIN GRID */}
      <div>
      {/* <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-24"> */}

        {/* LEFT COLUMN: Stats */}
        {/* <div className="lg:col-span-7 space-y-16">

          <section aria-labelledby="activity-heading">
            <h2 id="activity-heading" className="text-xs font-semibold uppercase tracking-[0.2em] mb-6 lg:mb-8 transition-colors duration-500">
              Activity
            </h2>

            <div className="grid grid-cols-2 gap-8">
              <div className="flex flex-col gap-2 p-1">
                <span className="text-sm text-muted-foreground">Tasks Completed</span>
                <div className="text-4xl md:text-5xl lg:text-6xl font-light tracking-tighter tabular-nums text-accent">
                  {stats.tasksCompleted}
                </div>
              </div>
              <div className="flex flex-col gap-2 p-1">
                <span className="text-sm text-muted-foreground">Open Tasks</span>
                <div className="text-4xl md:text-5xl lg:text-6xl font-light tracking-tighter tabular-nums">
                  {stats.tasksOpen}
                </div>
              </div>
            </div>
          </section>

          <section aria-labelledby="finance-heading">
            <h2 id="finance-heading" className="text-xs font-semibold uppercase tracking-[0.2em] mb-6 lg:mb-8 transition-colors duration-500">
              Total Tracked
            </h2>

            <div className="flex flex-col gap-2 p-1">
              <span className="text-sm text-muted-foreground">Across all categories</span>
              <div className="text-4xl md:text-5xl lg:text-6xl font-light tracking-tighter tabular-nums">
                {dollars}<span className="text-3xl lg:text-4xl">.{cents}</span>
              </div>
            </div>
          </section>

        </div> */}

        {/* RIGHT COLUMN: Preferences */}
        <aside className="lg:col-span-5 space-y-16 mt-8 lg:mt-0">
          <ProfileSettings email={user.email} />
        </aside>

      </div>
    </PageComponent>
  )
}