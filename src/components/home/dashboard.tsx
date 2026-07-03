'use client'

import dynamic from 'next/dynamic'
import{ useState, useMemo } from 'react'
import { format } from 'date-fns'
import {
  Calendar, CheckSquare, Activity,
} from 'lucide-react'

import PageComponent from '@/components/shared/PageComponent'
import { Checkbox } from '@/components/ui/checkbox'
import { Task, UserSummary} from '@/types/dashboard'
import { GreetingHeader } from './greetingHeader'
import { WeatherCard } from '@/components/home/weatherCard'

// Life Progress bar
const LifeProgress = dynamic(
  () => import('@/components/home/LifeProgress')
  .then(mod => mod.LifeProgress),
  { ssr: false }
);

interface DashboardPageProps {
  initialTasks?: Task[];
  user?: UserSummary;
}

export default function DashboardPage({
  initialTasks = [
    {
      id: "f47ac10b-58cc-4372-a567-0e02b2c3d479",
      user_id: "user-123",
      task_name: "Buy groceries",
      task_category_id: "groceries",
      time: "10:00",
      is_done: false,
      created_for_date: "2026-07-04",
      created_at: "2026-07-04T08:00:00Z"
    },
    {
      id: "a92bd12c-49aa-4183-b921-1f93c3d4e580",
      user_id: "user-123",
      task_name: "Meeting with John",
      task_category_id: "meeting",
      time: "14:30",
      is_done: true,
      created_for_date: "2026-07-04",
      created_at: "2026-07-04T09:00:00Z"
    },
    {
      id: "c83ef23d-12bb-5294-c832-2a84d4e5f691",
      user_id: "user-123",
      task_name: "Finish design mockups",
      task_category_id: "work",
      time: "16:00",
      is_done: false,
      created_for_date: "2026-07-04",
      created_at: "2026-07-04T10:00:00Z"
    }
  ],
  user = {
    firstName: 'Gilbert',
    meetingsCount: 3,
    tasksCount: 6,
    habitsCount: 1,
    balance: 150250.75
  }
}: DashboardPageProps) {

  const today = new Date ();
  // const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());

  const [tasks, setTasks] = useState<Task[]>(initialTasks);

  const tasksForSelectedDate = useMemo(() => {

    // TODO: Filter tasks based on selectedDate once tasks have date properties
    return tasks;
  }, [tasks, today]);

  const handleToggleTask = async (taskId: string) => {
    setTasks(currentTasks =>
      currentTasks.map(task =>
        task.id === taskId ? { ...task, is_done: !task.is_done } : task
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

        <GreetingHeader firstName='Gilbert' tasks={tasksForSelectedDate}/>

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
                  className={`flex items-center justify-between py-5 lg:py-6 border-b border-dashed cursor-pointer group transition-all duration-300 ${task.is_done ? 'opacity-40' : 'hover:opacity-80'}`}
                >
                  <div className="flex items-center gap-4 lg:gap-6">
                    <Checkbox
                      className="rounded-full border-2"
                      checked={task.is_done}
                      onCheckedChange={() => handleToggleTask(task.id)}
                      aria-label={`Mark "${task.task_name}" as ${task.is_done ? 'incomplete' : 'complete'}`}
                    />
                    <div className="flex flex-col gap-1">
                      <span className={`text-base lg:text-lg tracking-wide ${task.is_done ? 'line-through' : ''}`}>
                        {task.task_name}
                      </span>
                      <span className="text-[10px] lg:text-xs font-medium tracking-wider uppercase transition-colors duration-500">
                        {task.task_category_id}
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
          {/* // TODO: make it functional */}
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