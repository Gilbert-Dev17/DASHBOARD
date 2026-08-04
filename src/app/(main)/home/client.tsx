'use client'

import dynamic from 'next/dynamic'

import PageComponent from '@/components/Shared/PageComponent'
import { TaskWithSubtasks, UserSummary } from '@/types/dashboard'
import { GreetingHeader } from '@/components/Home/GreetingHeader'

import { Skeleton } from "@/components/ui/skeleton"

const LifeProgress = dynamic(
  () => import('@/components/Home/LifeProgress').then(mod => mod.LifeProgress),
  {
    ssr: false,
    loading: () => (
      <div aria-hidden="true" className="w-full flex flex-col md:flex-row items-center justify-between gap-4 md:gap-8">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="flex items-center gap-3 w-full">
            <Skeleton className="h-3 w-12" />
            <Skeleton className="h-[2px] flex-1" />
            <Skeleton className="h-3 w-10" />
          </div>
        ))}
      </div>
    )
  }
);

interface DashboardPageProps {
  initialTasks: TaskWithSubtasks[];
  user: UserSummary;
}

export default function DashboardPage({ initialTasks, user}: DashboardPageProps) {

  const displayName = user?.first_name || user?.name?.split(' ')[0] || 'User';

  return (
    <PageComponent>
      <div className="flex flex-col justify-center flex-1 w-full max-w-5xl mx-auto">
        <GreetingHeader firstName={displayName} tasks={initialTasks || []} />
      </div>

      <div className="w-full pb-2 mt-auto">
        <LifeProgress />
      </div>

    </PageComponent>
  )
}