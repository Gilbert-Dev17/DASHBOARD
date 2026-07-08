'use client'

import{ useState, useMemo, useEffect } from 'react'
import { useMutation } from '@tanstack/react-query'
import { Checkbox } from '@/components/ui/checkbox'
import { TaskWithSubtasks } from '@/types/dashboard'
import { formatTime } from '@/lib/formatTime'
import { toast } from "sonner";

import { toggleTask, toggleSubTask } from '@/lib/actions/updateTasks'

interface Tasks { initialTasks: TaskWithSubtasks[] }

export const AgendaSection = ({ initialTasks }:Tasks) => {

    const today = new Date ();
    const [tasks, setTasks] = useState<TaskWithSubtasks[]>(initialTasks || []);
    // !! update use useMutate from tanstack, for instant caching?

    // Keep local optimistic state in sync with server realtime updates
    useEffect(() => {
      setTasks(initialTasks || []);
    }, [initialTasks]);

    const tasksForSelectedDate = useMemo(() => {
      return tasks
    }, [tasks, today]);

    const handleToggleTask = async ( taskId: string, isDone: boolean, task_name: string) => {
        setTasks(current =>
            current.map(task => {
                if (task.id !== taskId) return task;
                return {
                    ...task,
                    is_done: isDone,
                    subtasks: task.subtasks ? task.subtasks.map(st => ({ ...st, is_done: isDone })) : []
                };
            })
        );
        try {
            const result = await toggleTask(taskId, isDone);

            if (!result.success) {
                setTasks(current =>
                    current.map(task => {
                        if (task.id !== taskId) return task;
                        return {
                            ...task,
                            is_done: !isDone,
                            subtasks: task.subtasks ? task.subtasks.map(st => ({ ...st, is_done: !isDone })) : []
                        };
                    })
                );
                toast.error(result.message);
                return;
            }

            toast.success(
                isDone
                    ? `"${task_name}" completed.`
                    : `"${task_name}" reopened.`
                );
        } catch {
            // Network-level error (e.g. user lost internet connection before fetch could fire)
            setTasks(current =>
                current.map(task => {
                    if (task.id !== taskId) return task;
                    return {
                        ...task,
                        is_done: !isDone,
                        subtasks: task.subtasks ? task.subtasks.map(st => ({ ...st, is_done: !isDone })) : []
                    };
                })
            );
            toast.error("Failed to update task.");
        }
    };

    const handleToggleSubtask = async (taskId: string, subtaskId: string, isDone: boolean, subtask_name: string) => {
        setTasks(currentTasks =>
            currentTasks.map(task => {
                if (task.id !== taskId) return task;
                if (!task.subtasks) return task;

                return {
                    ...task,
                    subtasks: task.subtasks.map(st =>
                        st.id === subtaskId ? { ...st, is_done: isDone } : st
                    )
                };
            })
        );
        try {
            const result = await toggleSubTask(subtaskId, isDone);

            if (!result.success) {
                // Application-level error
                setTasks(currentTasks =>
                    currentTasks.map(task => {
                        if (task.id !== taskId) return task;
                        if (!task.subtasks) return task;

                        return {
                            ...task,
                            subtasks: task.subtasks.map(st =>
                                st.id === subtaskId ? { ...st, is_done: !isDone } : st
                            )
                        };
                    })
                );
                toast.error(result.message);
                return;
            }

            toast.success(
                isDone
                    ? `"${subtask_name}" completed.`
                    : `"${subtask_name}" reopened.`
                );
        } catch {
            setTasks(currentTasks =>
                currentTasks.map(task => {
                    if (task.id !== taskId) return task;
                    if (!task.subtasks) return task;

                    return {
                        ...task,
                        subtasks: task.subtasks.map(st =>
                            st.id === subtaskId ? { ...st, is_done: !isDone } : st
                        )
                    };
                })
            );
            toast.error("Failed to update subtask.");
        }
    };

  return (
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
                    onCheckedChange={() => handleToggleTask(task.id, !task.is_done, task.task_name)}
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
                    {formatTime(task.time)}
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
                          onCheckedChange={() => handleToggleSubtask(task.id, subtask.id, !subtask.is_done, subtask.subtask_name)}
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
  )
}