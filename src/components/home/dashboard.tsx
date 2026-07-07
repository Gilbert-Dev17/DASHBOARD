'use client'

import dynamic from 'next/dynamic'
import{ useState, useMemo } from 'react'
import PageComponent from '@/components/shared/PageComponent'
import { TaskWithSubtasks, UserSummary} from '@/types/dashboard'
import { GreetingHeader } from './greetingHeader'
import { WeatherCard } from '@/components/home/weatherCard'
import { AgendaSection } from './taskCheckList'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
} from "@/components/ui/carousel"

// * Life Progress bar
const LifeProgress = dynamic(
  () => import('@/components/home/LifeProgress')
  .then(mod => mod.LifeProgress),
  { ssr: false }
);

interface DashboardPageProps {
  initialTasks: TaskWithSubtasks[];
  user: UserSummary;
}

export default function DashboardPage({ initialTasks, user, }: DashboardPageProps) {

  const today = new Date ();
  const [tasks, setTasks] = useState<TaskWithSubtasks[]>(initialTasks || []);
  const tasksForSelectedDate = useMemo(() => {
    return tasks
  }, [tasks, today]);

    const balance = 100

    const formattedBalance = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'PHP',
    }).format(balance  ?? 0);

    const [dollars, cents] = formattedBalance.split('.');

  return (
    <PageComponent>
      {/* HEADER SECTION */}
      <header className="mb-16 lg:mb-20">
        <GreetingHeader firstName={user.first_name|| 'User'} tasks={tasksForSelectedDate}/>

        <WeatherCard />
      </header>

      <pre className="bg-muted p-4 rounded text-xs overflow-auto max-h-96">
        {JSON.stringify(user, null, 2)}
      </pre>
      <pre className="bg-muted p-4 rounded text-xs overflow-auto max-h-96">
        {JSON.stringify(initialTasks, null, 2)}
      </pre>

      {/* MAIN GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-24">

        {/* AGENDA SECTION */}
        <AgendaSection initialTasks={tasksForSelectedDate} />

        {/* SIDEBAR WIDGETS */}
        <aside className="lg:col-span-5 space-y-16 mt-8 lg:mt-0">

          {/* FINANCES / ACCOUNTS SECTION */}
          <section aria-labelledby="finances-heading">
            <Carousel className="w-full max-w-sm" opts={{ align: "start" }}>
              <div className="flex items-center justify-between mb-6 lg:mb-8">
                <h2 id="finances-heading" className="text-xs font-semibold uppercase tracking-[0.2em] transition-colors duration-500">
                  Accounts
                </h2>
                <div className="flex gap-2">
                  <CarouselPrevious className="static translate-y-0 h-8 w-8 border-transparent bg-transparent hover:bg-muted text-muted-foreground" />
                  <CarouselNext className="static translate-y-0 h-8 w-8 border-transparent bg-transparent hover:bg-muted text-muted-foreground" />
                </div>
              </div>

              <CarouselContent>
                {[
                  { id: '1', name: 'Main Bank Account', balance: 150250.75, currency: 'PHP' },
                  { id: '2', name: 'GCash', balance: 4500.00, currency: 'PHP' },
                  { id: '3', name: 'Emergency Fund', balance: 50000.00, currency: 'PHP' }
                ].map((wallet) => {
                  const formattedBalance = new Intl.NumberFormat('en-US', {
                    style: 'currency',
                    currency: wallet.currency,
                  }).format(wallet.balance);
                  const [dollars, cents] = formattedBalance.split('.');

                  return (
                    <CarouselItem key={wallet.id} className="basis-[85%] lg:basis-full pl-4">
                      <div className="flex flex-col gap-2 p-1">
                        <span className="text-sm text-muted-foreground">{wallet.name}</span>
                        <div className="text-4xl md:text-5xl lg:text-6xl font-light tracking-tighter tabular-nums">
                          {dollars}<span className="text-3xl lg:text-4xl">.{cents}</span>
                        </div>
                      </div>
                    </CarouselItem>
                  );
                })}
              </CarouselContent>
            </Carousel>
          </section>

          {/* PROGRESS SECTION */}
          <LifeProgress />

        </aside>
      </div>
    </PageComponent>
  )
}