export const instant = false;
import { ReactNode, Suspense } from 'react'
import { RealtimeSync } from '@/components/Shared/RealTimeSync'

import Sidebar from '@/components/Navbar/Sidebar'
import { Mobilebar } from '@/components/Navbar/Mobilebar'

import { getUser } from '@/lib/auth/get-user'

async function SidebarWrapper() {
  const user = await getUser()

  return (
    <>
      <div className="lg:hidden">
        <Mobilebar user={user} />
      </div>

      <div className="hidden lg:block">
        <Sidebar user={user} />
      </div>
    </>
  )
}

export default function MainLayout({children}: Readonly<{children: ReactNode}>){
    return (
      <section className="min-h-full flex flex-col" suppressHydrationWarning>
          <RealtimeSync />
          <Suspense fallback={null}>
              <SidebarWrapper />
          </Suspense>
          <main className="flex-1 pb-24 lg:pb-0">
              {children}
          </main>
      </section>
    )
}