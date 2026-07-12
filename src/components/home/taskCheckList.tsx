'use client'

import { useState, useEffect } from 'react'
import { useMutation } from '@tanstack/react-query'
import { Checkbox } from '@/components/ui/checkbox'
import { TaskWithSubtasks } from '@/types/dashboard'
import { formatTime } from '@/lib/formatTime'
import { toast } from "sonner"
import { Card, CardContent, } from '@/components/ui/card'
import { toggleTask, toggleSubTask } from '@/lib/actions/toggleTasks'
import { UpdateTaskModal } from '@/components/modals/task-updateModal/UpdateTaskModal'
import type { ParsedTask } from '@/utils/parseTaskLines'

interface TasksProps {
  initialTasks: TaskWithSubtasks[]
  selectedDateStr?: string
  showTitle?: boolean
}

function getOptimisticTasks(tasks: TaskWithSubtasks[], taskId: string, isDone: boolean): TaskWithSubtasks[] {
  return tasks.map(task => {
    if (task.id !== taskId) return task
    return {
      ...task,
      is_done: isDone,
      subtasks: task.subtasks ? task.subtasks.map(st => ({ ...st, is_done: isDone })) : []
    }
  })
}

function getOptimisticSubtasks(tasks: TaskWithSubtasks[], taskId: string, subtaskId: string, isDone: boolean): TaskWithSubtasks[] {
  return tasks.map(task => {
    if (task.id !== taskId || !task.subtasks) return task
    return {
      ...task,
      subtasks: task.subtasks.map(st => st.id === subtaskId ? { ...st, is_done: isDone } : st)
    }
  })
}

export const AgendaSection = ({ initialTasks, selectedDateStr, showTitle = true }: TasksProps) => {

  const [tasks, setTasks] = useState<TaskWithSubtasks[]>(initialTasks || [])
  const [editingTask, setEditingTask] = useState<TaskWithSubtasks | null>(null)

  useEffect(() => {
      setTasks(initialTasks || [])
    }, [initialTasks])
  // TODO: turn into a reusable component
    //* Listen for optimistic tasks from QuickAddModal
    useEffect(() => {
      const handler = (e: Event) => {
        const parsed = (e as CustomEvent<ParsedTask[]>).detail

        const optimistic: TaskWithSubtasks[] = parsed.map(p => ({
          id: crypto.randomUUID(),
          user_id: '',
          task_name: p.name,
          time: p.time || undefined,
          is_done: false,
          created_for_date: selectedDateStr || new Date().toISOString().split('T')[0],
          created_at: new Date().toISOString(),
          task_category: p.category ? { id: null, name: p.category } : null,
          subtasks: p.subtasks.map(s => ({
            id: crypto.randomUUID(),
            task_id: '',
            subtask_name: s,
            is_done: false,
            created_at: new Date().toISOString(),
          })),
        }))

        setTasks(current => {
          const merged = [...current, ...optimistic]
          return merged.sort((a, b) => {
            if (a.time && b.time) return a.time.localeCompare(b.time)
            if (a.time && !b.time) return -1
            if (!a.time && b.time) return 1
            return 0
          })
        })
      }

      window.addEventListener('optimistic-tasks', handler)
      return () => window.removeEventListener('optimistic-tasks', handler)
      // Pass selectedDateStr into the dependency array so it binds correctly
  }, [selectedDateStr])

  const { mutate: handleToggleTask } = useMutation({
    mutationFn: async ({ taskId, isDone, taskName }: { taskId: string, isDone: boolean, taskName: string }) => {
      const result = await toggleTask(taskId, isDone)
      if (!result.success) throw new Error(result.message)
      return { isDone, taskName }
    },
    onMutate: async ({ taskId, isDone }) => {
      setTasks(current => getOptimisticTasks(current, taskId, isDone))
    },
    onSuccess: ({ isDone, taskName }) => {
      toast.success(isDone ? `"${taskName}" completed.` : `"${taskName}" reopened.`)
    },
    onError: (error, { taskId, isDone }) => {
      setTasks(current => getOptimisticTasks(current, taskId, !isDone))
      toast.error(error.message || "Failed to update task.")
    }
  })

  const { mutate: handleToggleSubtask } = useMutation({
    mutationFn: async ({ taskId, subtaskId, isDone, subtaskName }: { taskId: string, subtaskId: string, isDone: boolean, subtaskName: string }) => {
      const result = await toggleSubTask(subtaskId, isDone)
      if (!result.success) throw new Error(result.message)
      return { isDone, subtaskName }
    },
    onMutate: async ({ taskId, subtaskId, isDone }) => {
      setTasks(current => getOptimisticSubtasks(current, taskId, subtaskId, isDone))
    },
    onSuccess: ({ isDone, subtaskName }) => {
      toast.success(isDone ? `"${subtaskName}" completed.` : `"${subtaskName}" reopened.`)
    },
    onError: (error, { taskId, subtaskId, isDone }) => {
      setTasks(current => getOptimisticSubtasks(current, taskId, subtaskId, !isDone))
      toast.error(error.message || "Failed to update subtask.")
    }
  })

  return (
    <>
    <section className="lg:col-span-7 flex flex-col h-full overflow-hidden" aria-labelledby="agenda-heading">
      {showTitle && (
        <div className="flex justify-between items-end mb-6 lg:mb-8 shrink-0">
          <h2 id="agenda-heading" className="text-xs font-semibold uppercase tracking-[0.2em] transition-colors duration-500">
            Today's Agenda
          </h2>
        </div>
      )}

      {tasks.length === 0 ? (
        <p className="text-muted-foreground py-4">No tasks for today.</p>
      ) : (
        <div className="flex-1 min-h-0 max-h-[650px] pr-4 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          <div className="relative pb-8 pt-4">
            {/* Timeline Axis Line */}
            <div className="absolute top-0 -bottom-25 left-20 w-px bg-border/50" />

            <ol className="space-y-10 list-none m-0 p-0">
              {tasks.map((task) => (
                <li key={task.id} className="relative flex items-start min-h-12 w-full">

                  {/* Left Side: Time & Axis Dot */}
                  <div className="absolute left-0 top-4 w-20 flex items-center justify-end">
                    <time dateTime={task.time || undefined} className="text-[10px] font-mono tabular-nums text-muted-foreground mr-4 leading-none tracking-widest uppercase">
                      {task.time && task.time.split(':').length === 3 && task.time.split(':')[2] !== '00'
                        ? 'OPEN BLOCK'
                        : (task.time ? formatTime(task.time) : '--:--')}
                    </time>

                    {/* Axis Dot */}
                    <div className="absolute -right-1 h-2 w-2 rounded-full bg-accent ring-4 ring-background z-10 transition-colors duration-300" />
                  </div>
                  {/* Task Card Container */}
                  <article className="pl-28 w-full">
                    <Card
                      className={`w-full max-w-lg transition-all duration-300 hover:-translate-y-0.5 border-dashed cursor-pointer ${
                        task.is_done ? 'opacity-50 grayscale bg-muted/30' : 'bg-card'
                      }`}
                      onClick={() => setEditingTask(task)}
                    >
                      <CardContent className="flex flex-col gap-3">

                        {/* Task Header */}
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex flex-col gap-1">
                            <span className={`font-medium text-sm tracking-wide ${task.is_done ? 'line-through text-muted-foreground' : ''}`}>
                              {task.task_name}
                            </span>
                            <span className="text-[10px] font-semibold uppercase tracking-wider text-accent">
                              {task.task_category?.name}
                            </span>
                          </div>

                          <Checkbox
                            className="rounded-full border-2 shrink-0 mt-0.5"
                            checked={task.is_done}
                            onClick={(e) => e.stopPropagation()}
                            onCheckedChange={(checked) => handleToggleTask({
                              taskId: task.id,
                              isDone: checked as boolean,
                              taskName: task.task_name
                            })}
                            aria-label={`Mark "${task.task_name}" as ${task.is_done ? 'incomplete' : 'complete'}`}
                          />
                        </div>

                        {/* Subtasks */}
                        {task.subtasks && task.subtasks.length > 0 && (
                          <ul className="mt-1 space-y-2.5 border-l-2 border-muted pl-3 ml-1 list-none m-0">
                            {task.subtasks.map((st) => (
                              <li key={st.id} className="flex items-center justify-between gap-3 group">
                                <span className={`text-xs ${st.is_done ? 'line-through text-muted-foreground' : 'text-foreground/90'}`}>
                                  {st.subtask_name}
                                </span>
                                <Checkbox
                                  className="rounded-sm border-2 w-3.5 h-3.5 opacity-0 group-hover:opacity-100 data-[state=checked]:opacity-100 transition-opacity"
                                  checked={st.is_done}
                                  onClick={(e) => e.stopPropagation()}
                                  onCheckedChange={(checked) => handleToggleSubtask({
                                    taskId: task.id,
                                    subtaskId: st.id,
                                    isDone: checked as boolean,
                                    subtaskName: st.subtask_name
                                  })}
                                />
                              </li>
                            ))}
                          </ul>
                        )}
                      </CardContent>
                    </Card>
                  </article>
                </li>
              ))}
            </ol>
          </div>
        </div>
      )}
    </section>

    {/* Edit Task Modal */}
    {editingTask && (
      <UpdateTaskModal
        task={editingTask}
        open={!!editingTask}
        onOpenChange={(open) => { if (!open) setEditingTask(null) }}
      />
    )}
  </>
  )
}