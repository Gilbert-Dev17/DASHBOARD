'use client'

import dynamic from 'next/dynamic'

import PageComponent from '@/components/shared/PageComponent'
import { TaskWithSubtasks, UserSummary, WalletSummary } from '@/types/dashboard'
import { WalletSnapshot } from '@/types/database'
import { GreetingHeader } from './greetingHeader'
import { AgendaSection } from '@/components/shared/AgendaSection'
import { NetWorthOverview } from './NetWorthOverview'

import { useDashboard } from '@/hooks/useDashboard'
import { Skeleton } from "@/components/ui/skeleton"

const LifeProgress = dynamic(
  () => import('@/components/home/LifeProgress').then(mod => mod.LifeProgress),
  {
    ssr: false,
    loading: () => (
      <section aria-hidden="true" className="w-full">
        <Skeleton className="h-4 w-32 mb-6 lg:mb-8" />
        <div className="space-y-6 lg:space-y-8">
          {[1, 2, 3].map((i) => (
            <div key={i} className="space-y-2">
              <div className="flex items-center justify-between">
                <Skeleton className="h-4 w-12" />
                <Skeleton className="h-4 w-10" />
              </div>
              <Skeleton className="h-3 w-full rounded-full" />
            </div>
          ))}
        </div>
      </section>
    )
  }
);

interface DashboardPageProps {
  initialTasks: TaskWithSubtasks[];
  user: UserSummary;
  wallets: WalletSummary[];
  historicalSnapshots?: WalletSnapshot[];
}

export default function DashboardPage({ initialTasks, user, wallets, historicalSnapshots = [] }: DashboardPageProps) {
  useDashboard();

  return (
    <PageComponent>
      {/* HEADER SECTION */}
      <header className="mb-16 lg:mb-20">
        <GreetingHeader firstName={user.first_name|| 'User'} tasks={initialTasks || []} />
      </header>

      {/* <pre className="bg-muted p-4 rounded text-xs overflow-auto max-h-96">
        {JSON.stringify(initialTasks, null, 2)}
       </pre> */}

      {/* MAIN GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-24">

        {/* AGENDA SECTION */}
        <AgendaSection initialTasks={initialTasks || []} />

        {/* SIDEBAR WIDGETS */}
        <aside className="lg:col-span-5 space-y-8 mt-8 lg:mt-0">

        {/* FINANCES / ACCOUNTS SECTION */}
        <NetWorthOverview wallets={wallets} historicalSnapshots={historicalSnapshots} />

        {/* PROGRESS SECTION */}
        <LifeProgress />

        </aside>
      </div>
    </PageComponent>
  )
}