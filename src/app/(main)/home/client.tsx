'use client'

import dynamic from 'next/dynamic'

import PageComponent from '@/components/shared/PageComponent'
import { TaskWithSubtasks, UserSummary, WalletSummary } from '@/types/dashboard'
import { WalletSnapshot } from '@/types/database'
import { GreetingHeader } from '@/components/Home/greetingHeader'
import { AgendaSection } from '@/components/Shared/AgendaSection'
import { NetWorthOverview } from '@/components/Home/NetWorthOverview'
import { useCurrencyFilter } from '@/hooks/useCurrencyFilter'

import { Skeleton } from "@/components/ui/skeleton"

const LifeProgress = dynamic(
  () => import('@/components/Home/LifeProgress').then(mod => mod.LifeProgress),
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

  const displayName = user?.first_name || user?.name?.split(' ')[0] || 'User';

  const { filteredWallets, activeCurrency } = useCurrencyFilter({user, wallets})

  return (
    <PageComponent>
      <header className="mb-16 lg:mb-20">
        <GreetingHeader firstName={displayName} tasks={initialTasks || []} />
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-24">

        <div className="block lg:hidden">
          <NetWorthOverview wallets={filteredWallets} historicalSnapshots={historicalSnapshots} activeCurrency={activeCurrency} />
        </div>

        <AgendaSection initialTasks={initialTasks || []} />

        <aside className="lg:col-span-5 space-y-8 mt-8 lg:mt-0">

        <div className="hidden lg:block">
          <NetWorthOverview wallets={filteredWallets} historicalSnapshots={historicalSnapshots} activeCurrency={activeCurrency} />
        </div>

        <LifeProgress />

        </aside>
      </div>
    </PageComponent>
  )
}