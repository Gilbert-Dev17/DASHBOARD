'use client'

import Link from 'next/link'
import { Suspense } from 'react'
import { usePathname } from 'next/navigation'
import { Home, CheckSquare, PiggyBank } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { getActiveQuickAdds } from './quick-add-registry'
import { SyncIndicator } from '../Shared/SyncIndicator'

import type { UserSummary } from '@/types/dashboard'

interface MobilebarProps {
  user?: UserSummary | null
}

export const Mobilebar = ({ user }: MobilebarProps) => {
  const pathname = usePathname()
  const activeQuickAdds = getActiveQuickAdds(pathname)

  const navItems = [
    { icon: Home, label: 'Home', href: '/home' },
    { icon: CheckSquare, label: 'Schedule', href: '/schedule' },
    { icon: PiggyBank, label: 'Finance', href: '/finance' },
  ]

  const initials = user?.first_name
    ? user.first_name.charAt(0).toUpperCase()
    : user?.email?.charAt(0).toUpperCase() || 'U'

  return (
    <>
      <aside className="fixed bottom-4 left-1/2 z-50 -translate-x-1/2 flex flex-row items-center gap-4">
        <nav className="relative flex items-center gap-2 rounded-2xl border bg-background/80 p-2 backdrop-blur-xl shadow-lg">

          {/* Realtime Sync Indicator */}
          <div className="absolute -top-1 -right-1 z-50">
            <SyncIndicator />
          </div>

          {navItems.map(({ icon: Icon, label, href }) => {
            const active = pathname === href

            return (
              <Button
                key={href}
                asChild
                variant={active ? "default" : "ghost"}
                className={`h-12 rounded-xl transition-all duration-300 ${
                    active ? "px-4" : "w-12"
                }`}
                >
                    <Link href={href} className="flex items-center gap-2">
                        <Icon className="h-5 w-5 shrink-0" />

                        <span
                        className={`overflow-hidden whitespace-nowrap transition-all duration-300 ${
                            active
                            ? "max-w-24 opacity-100"
                            : "max-w-0 opacity-0"
                        }`}
                        >
                        {label}
                        </span>
                    </Link>
                </Button>
            )
          })}

          <Button
            asChild
            variant={pathname === '/profile' ? 'default' : 'ghost'}
            size="icon"
            className="h-12 w-12 rounded-xl"
          >
            <Link href="/profile" aria-label="Profile">
              <Avatar className="h-8 w-8">
                <AvatarImage
                  src={user?.avatar_url || undefined}
                  alt="Profile"
                />
                <AvatarFallback>{initials}</AvatarFallback>
              </Avatar>
            </Link>
          </Button>
        </nav>

      <Suspense fallback={null}>
        {activeQuickAdds.map(({ id, Component }) => (
          <Component key={id} enableShortcut={false} />
        ))}
      </Suspense>
      </aside>

    </>
  )
}