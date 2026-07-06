'use client'

import dynamic from 'next/dynamic'
import{ useState, useMemo } from 'react'
import PageComponent from '@/components/shared/PageComponent'
import { Checkbox } from '@/components/ui/checkbox'
import { TaskWithSubtasks, UserSummary} from '@/types/dashboard'
import { GreetingHeader } from './greetingHeader'
import { WeatherCard } from '@/components/home/weatherCard'

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
    // TODO: Filter tasks based on selectedDate once tasks have date properties
    return tasks
  }, [tasks, today]);

  const handleToggleTask = async (taskId: string) => {
    setTasks(currentTasks =>
      currentTasks.map(task =>
        task.id === taskId ? { ...task, is_done: !task.is_done } : task
      )
    );

  };

   const handleToggleSubtask = async (taskId: string, subtaskId: string) => {
    setTasks(currentTasks =>
      currentTasks.map(task => {
        if (task.id !== taskId) return task;
        if (!task.subtasks) return task;

        return {
          ...task,
          subtasks: task.subtasks.map(st =>
            st.id === subtaskId ? { ...st, is_done: !st.is_done } : st
          )
        };
      })
    );
  };

  // const formattedBalance = new Intl.NumberFormat('en-US', {
  //   style: 'currency',
  //   currency: 'PHP',
  // }).format(user?.balance ?? 0);

  // const [dollars, cents] = formattedBalance.split('.');

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
                  className={`flex flex-col py-5 lg:py-6 border-b border-dashed transition-all duration-300 group`}
                >
                  <div className={`flex items-center justify-between w-full cursor-pointer ${task.is_done ? 'opacity-40' : 'hover:opacity-80'}`}>
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
                          {task.task_category?.name}
                        </span>
                      </div>
                    </div>
                    {task.time && (
                      <time dateTime={task.time} className="text-sm font-medium tabular-nums">
                        {task.time}
                      </time>
                    )}
                  </div>

                  {/* SUBTASKS */}
                  {task.subtasks && task.subtasks.length > 0 && (
                    <div className="mt-4 ml-10 lg:ml-12 flex flex-col gap-3">
                      {task.subtasks.map(subtask => (
                        <div key={subtask.id} className={`flex items-center gap-3 ${subtask.is_done ? 'opacity-50' : 'hover:opacity-80'}`}>
                           <Checkbox
                              className="rounded-sm border-2 w-4 h-4"
                              checked={subtask.is_done}
                              onCheckedChange={() => handleToggleSubtask(task.id, subtask.id)}
                              aria-label={`Mark "${subtask.subtask_name}" as ${subtask.is_done ? 'incomplete' : 'complete'}`}
                            />
                            <span className={`text-sm ${subtask.is_done ? 'line-through' : ''}`}>
                              {subtask.subtask_name}
                            </span>
                        </div>
                      ))}
                    </div>
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
              {/* {dollars}<span className="text-3xl lg:text-4xl">.{cents}</span> */}
            </div>
          </section>

          {/* PROGRESS SECTION */}
          <LifeProgress />

        </aside>
      </div>
    </PageComponent>
  )
}