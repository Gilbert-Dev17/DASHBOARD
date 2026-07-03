'use client'

import dynamic from 'next/dynamic'
import{ useState, useMemo } from 'react'
import { format } from 'date-fns'
import {
  Calendar, CheckSquare, Activity,
} from 'lucide-react'

import PageComponent from '@/components/shared/PageComponent'
import { Checkbox } from '@/components/ui/checkbox'
import { Task, WeatherData, UserSummary} from '@/types/dashboard'
import { WeatherCard } from '@/components/home/weatherCard'

const LifeProgress = dynamic(
  () => import('@/components/home/LifeProgress')
  .then(mod => mod.LifeProgress),
  { ssr: false }
);

interface DashboardPageProps {
  initialTasks?: Task[];
  weather?: WeatherData;
  user?: UserSummary;
}

export default function DashboardPage({
  initialTasks = [],
  user = {
    firstName: 'Gilbert',
    meetingsCount: 3,
    tasksCount: 6,
    habitsCount: 1,
    balance: 150250.75
  }
}: DashboardPageProps) {

  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());

  // Initialize state with backend data
  const [tasks, setTasks] = useState<Task[]>(initialTasks);

  const dayOfWeek = useMemo(() => {
    if (!selectedDate) return 'Today';
    return format(selectedDate, 'E');
  }, [selectedDate]);

  const tasksForSelectedDate = useMemo(() => {
    if (!selectedDate) return tasks;
    // TODO: Filter tasks based on selectedDate once tasks have date properties
    return tasks;
  }, [tasks, selectedDate]);

  const handleToggleTask = async (taskId: number) => {
    setTasks(currentTasks =>
      currentTasks.map(task =>
        task.id === taskId ? { ...task, done: !task.done } : task
      )
    );

    // TODO: Await your backend API call or Server Action here
    // try {
    //   await updateTaskStatus(taskId);
    // } catch (error) {
    //   // Revert optimistic update on failure
    //   console.error("Failed to update task", error);
    // }
  };

  const formattedBalance = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(user.balance);

  const [dollars, cents] = formattedBalance.split('.');

  return (
    <PageComponent>
      {/* HEADER SECTION */}
      <header className="mb-16 lg:mb-20">
        <div className="flex justify-between items-start mb-8 lg:mb-12">
          <h1 className="text-6xl md:text-8xl lg:text-[9rem] font-bold tracking-tighter leading-none flex items-end">
            {dayOfWeek}
            <span className="w-3 h-3 md:w-4 md:h-4 lg:w-6 lg:h-6 rounded-full ml-3 md:ml-5 mb-2 md:mb-4 lg:mb-6 transition-colors duration-500 bg-accent" aria-hidden="true" />
          </h1>
        </div>

        <p className="text-2xl md:text-3xl lg:text-4xl leading-snug font-light max-w-4xl tracking-tight">
          Good Morning, <span className="font-bold">{user.firstName}</span>.
          You have <span className="inline-flex items-center gap-1 mx-1"><Calendar size={24} aria-hidden="true" /> {user.meetingsCount} meetings</span>,
          <span className="inline-flex items-center gap-1 mx-1"><CheckSquare size={24} aria-hidden="true" /> {user.tasksCount} tasks</span> and
          <span className="inline-flex items-center gap-1 mx-1"><Activity size={24} aria-hidden="true" /> {user.habitsCount} habit</span> today.
        </p>

        {/* WEATHER SECTION */}
       <WeatherCard />

      </header>

      {/* MAIN GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-24">

        {/* AGENDA SECTION */}
        <section className="lg:col-span-7" aria-labelledby="agenda-heading">
          <div className="flex justify-between items-end mb-6 lg:mb-8">
            <h2 id="agenda-heading" className="text-xs font-semibold uppercase tracking-[0.2em] transition-colors duration-500">
              Today's Agenda
            </h2>
          </div>

          <div className="flex flex-col" role="list">
            {tasksForSelectedDate.length === 0 ? (
              <p className="text-muted-foreground py-4">No tasks for today.</p>
            ) : (
              tasksForSelectedDate.map((task) => (
                <article
                  key={task.id}
                  role="listitem"
                  className={`flex items-center justify-between py-5 lg:py-6 border-b border-dashed cursor-pointer group transition-all duration-300 ${task.done ? 'opacity-40' : 'hover:opacity-80'}`}
                >
                  <div className="flex items-center gap-4 lg:gap-6">
                    <Checkbox
                      className="rounded-full border-2"
                      checked={task.done}
                      onCheckedChange={() => handleToggleTask(task.id)}
                      aria-label={`Mark "${task.text}" as ${task.done ? 'incomplete' : 'complete'}`}
                    />
                    <div className="flex flex-col gap-1">
                      <span className={`text-base lg:text-lg tracking-wide ${task.done ? 'line-through' : ''}`}>
                        {task.text}
                      </span>
                      <span className="text-[10px] lg:text-xs font-medium tracking-wider uppercase transition-colors duration-500">
                        {task.category}
                      </span>
                    </div>
                  </div>
                  {task.time && (
                    <time dateTime={task.time} className="text-sm font-medium tabular-nums">
                      {task.time}
                    </time>
                  )}
                </article>
              ))
            )}
          </div>
        </section>

        {/* SIDEBAR WIDGETS */}
        <aside className="lg:col-span-5 space-y-16 mt-8 lg:mt-0">

          {/* FINANCES SECTION */}
          {/* // TODO: */}
          <section aria-labelledby="finances-heading">
            <h2 id="finances-heading" className="text-xs font-semibold uppercase tracking-[0.2em] mb-6 lg:mb-8 transition-colors duration-500">
              Finances
            </h2>
            <div className="text-4xl md:text-5xl lg:text-6xl font-light tracking-tighter tabular-nums mb-8">
              {dollars}<span className="text-3xl lg:text-4xl">.{cents}</span>
            </div>
          </section>

          {/* PROGRESS SECTION */}
          <LifeProgress />

        </aside>
      </div>
    </PageComponent>
  )
}