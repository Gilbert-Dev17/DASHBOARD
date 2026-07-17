'use client'

import { useState, useEffect } from 'react'
import { useMutation } from '@tanstack/react-query'
import { Checkbox } from '@/components/ui/checkbox'
import { Timeline, TimelineItem, TimelineTime, TimelineContent } from '@/components/ui/timeline'
import { TaskWithSubtasks } from '@/types/dashboard'
import { formatTime } from '@/lib/formatTime'
import { toast } from "sonner"
import { Card, CardContent, } from '@/components/ui/card'
import { toggleTask, toggleSubTask } from '@/lib/actions/toggleTasks'
import { UpdateTaskModal } from '@/components/modals/planner-modals/task-updateModal/UpdateTaskModal'
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

    //* Listen for optimistic task updates from UpdateTaskModal
    useEffect(() => {
      const handler = (e: Event) => {
        const { taskId, values } = (e as CustomEvent).detail

        setTasks(current => {
          const updated = current.map(task => {
            if (task.id !== taskId) return task

            return {
              ...task,
              task_name: values.task_name,
              time: values.time ? `${values.time}:00` : undefined,
              task_category: values.category ? { id: task.task_category?.id || null, name: values.category } : null,
              subtasks: (values.subtasks || []).map((st: any) => ({
                id: st.dbId || crypto.randomUUID(),
                task_id: taskId,
                subtask_name: st.name,
                is_done: task.subtasks?.find(oldSt => oldSt.id === st.dbId)?.is_done || false,
                created_at: new Date().toISOString()
              }))
            }
          })

          return updated.sort((a, b) => {
            if (a.time && b.time) return a.time.localeCompare(b.time)
            if (a.time && !b.time) return -1
            if (!a.time && b.time) return 1
            return 0
          })
        })
      }

      window.addEventListener('optimistic-task-update', handler)
      return () => window.removeEventListener('optimistic-task-update', handler)
    }, [])

    //* Listen for optimistic task deletions
    useEffect(() => {
      const handler = (e: Event) => {
        const { taskId } = (e as CustomEvent).detail
        setTasks(current => current.filter(t => t.id !== taskId))
      }

      window.addEventListener('optimistic-task-delete', handler)
      return () => window.removeEventListener('optimistic-task-delete', handler)
    }, [])

    //* Listen for task restoration (undo delete)
    useEffect(() => {
      const handler = (e: Event) => {
        const { task } = (e as CustomEvent).detail as { task: TaskWithSubtasks }
        setTasks(current => {
          // Avoid duplicates if the task is already present
          if (current.some(t => t.id === task.id)) return current

          const restored = [...current, task]
          return restored.sort((a, b) => {
            if (a.time && b.time) return a.time.localeCompare(b.time)
            if (a.time && !b.time) return -1
            if (!a.time && b.time) return 1
            return 0
          })
        })
      }

      window.addEventListener('optimistic-task-restore', handler)
      return () => window.removeEventListener('optimistic-task-restore', handler)
    }, [])

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
          <Timeline className="space-y-8">
            {tasks.map((task) => (
              <TimelineItem key={task.id}>

                <TimelineTime dateTime={task.time || undefined}>
                    {task.time && task.time.split(':').length === 3 && task.time.split(':')[2] !== '00'
                      ? 'OPEN BLOCK'
                      : (task.time ? formatTime(task.time) : '--:--')}
                </TimelineTime>

                <TimelineContent
                  withCard
                  className={`w-full cursor-pointer ${task.is_done ? 'opacity-50 grayscale' : ''}`}
                  onClick={() => setEditingTask(task)}
                >
                  <div className="flex flex-col gap-3">
                    {/* Task Header */}
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex flex-col">
                        <span className={`font-medium text-sm tracking-wide ${task.is_done ? 'line-through text-muted-foreground' : 'text-foreground/90 group-hover:text-foreground'}`}>
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
                  </div>
                </TimelineContent>
              </TimelineItem>
            ))}
          </Timeline>
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