'use client'

import { useState, useRef, useEffect, type KeyboardEvent } from 'react'
import { useForm, useFieldArray, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { X, Plus } from 'lucide-react'
import { TASK_CATEGORIES, CATEGORY_LABELS } from '@/lib/constants/tasks'
import { submitTaskEdit } from '@/lib/actions/edit-task'
import { TaskWithSubtasks } from '@/types/dashboard'
import { editTaskSchema, type EditTaskFormValues } from './schemas'
import { Kbd } from '@/components/ui/kbd'
import {
  Dialog, DialogContent, DialogDescription,
  DialogHeader, DialogTitle, DialogFooter
} from '@/components/ui/dialog'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { Spinner } from '@/components/ui/spinner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Field, FieldLabel, FieldGroup, FieldError } from '@/components/ui/field'
import { toast } from 'sonner'

import { DeleteTaskButton } from '../task-deleteModal/DeleteTaskButton'

interface UpdateTaskModalProps {
  task: TaskWithSubtasks
  open: boolean
  onOpenChange: (open: boolean) => void
}

export const UpdateTaskModal = ({ task, open, onOpenChange }: UpdateTaskModalProps) => {
  const [deletedSubtaskIds, setDeletedSubtaskIds] = useState<string[]>([])
  const [newSubtaskText, setNewSubtaskText] = useState('')
  const newSubtaskRef = useRef<HTMLInputElement>(null)

  const {
    register, handleSubmit, control, setValue, watch, reset, formState: { errors, isDirty },
  } = useForm<EditTaskFormValues>({
    resolver: zodResolver(editTaskSchema as any),
    defaultValues: {
      task_name: task.task_name,
      time: task.time ? task.time.slice(0, 5) : '',
      category: (task.task_category?.name as EditTaskFormValues['category']) || undefined,
      subtasks: task.subtasks?.map(st => ({ dbId: st.id, name: st.subtask_name })) || [],
    },
  })

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'subtasks',
  })

  // Reset form when task prop changes (different task clicked)
  useEffect(() => {
    reset({
      task_name: task.task_name,
      time: task.time ? task.time.slice(0, 5) : '',
      category: (task.task_category?.name as EditTaskFormValues['category']) || undefined,
      subtasks: task.subtasks?.map(st => ({ dbId: st.id, name: st.subtask_name })) || [],
    })
    setDeletedSubtaskIds([])
    setNewSubtaskText('')
  }, [task, reset])

  // ── Mutation ──
  const { mutate: editTask, isPending } = useMutation({
    mutationFn: ({ values, deletedIds }: { values: EditTaskFormValues, deletedIds: string[] }) => {
      const updated = values.subtasks
        .filter(st => st.dbId !== null)
        .map(st => ({ id: st.dbId!, subtask_name: st.name }))

      const added = values.subtasks
        .filter(st => st.dbId === null)
        .map(st => st.name)

      return submitTaskEdit({
        taskId: task.id,
        task_name: values.task_name,
        time: values.time ? `${values.time}:00` : null,
        category_name: values.category || null,
        subtasks: { updated, added, deleted: deletedIds },
      })
    },
    onSuccess: (result) => {
      if (result.success) {
        toast.success(result.message)
        onOpenChange(false)
      } else {
        toast.error(result.message)
      }
    },
    onError: (error) => {
      toast.error('Failed to update task: ' + error.message)
    },
  })

  // ── Subtask Handlers ──
  const addSubtask = () => {
    const trimmed = newSubtaskText.trim()
    if (!trimmed) return
    append({ dbId: null, name: trimmed })
    setNewSubtaskText('')
    requestAnimationFrame(() => newSubtaskRef.current?.focus())
  }

  const removeSubtask = (index: number) => {
    const subtaskValues = watch('subtasks')
    const removed = subtaskValues?.[index]
    if (removed?.dbId) {
      setDeletedSubtaskIds(prev => [...prev, removed.dbId!])
    }
    remove(index)
  }

  const handleNewSubtaskKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      addSubtask()
    }
  }

  const onSubmit = (values: EditTaskFormValues) => {
    window.dispatchEvent(new CustomEvent('optimistic-task-update', {
      detail: { taskId: task.id, values }
    }))
    editTask({ values, deletedIds: deletedSubtaskIds })
  }

  return (
    <Dialog open={open} onOpenChange={(value) => {
      onOpenChange(value)
      if (!value) {
        reset()
        setDeletedSubtaskIds([])
        setNewSubtaskText('')
      }
    }}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-bold">Edit Task</DialogTitle>
          <DialogDescription>
            Update the task details below.
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={handleSubmit(onSubmit)}
          onKeyDown={(e) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
              e.preventDefault()
              if (!isPending && newSubtaskText.trim().length === 0 && isDirty) {
                handleSubmit(onSubmit)()
              }
            }
          }}
          className="flex flex-col gap-5 mt-2"
          noValidate
        >

          {/* Task Name */}
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="edit-task-name" className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                Task Name
              </FieldLabel>
              <Controller
                name="task_name"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    id="edit-task-name"
                    placeholder="Enter task name"
                    autoFocus
                  />
                )}
              />
              <FieldError errors={[errors.task_name]} />
            </Field>
          </FieldGroup>

          {/* Time & Category Row */}
          <div className="grid grid-cols-2 gap-4">
            {/* Time */}
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="edit-task-time" className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                  Time
                </FieldLabel>
                <Controller
                  name="time"
                  control={control}
                  render={({ field }) => (
                    <Input
                      {...field}
                      id="edit-task-time"
                      type="time"
                    />
                  )}
                />
              </Field>
            </FieldGroup>

            {/* Category */}
            <FieldGroup>
              <Field>
                <FieldLabel className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                  Category
                </FieldLabel>
                <Controller
                  name="category"
                  control={control}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {TASK_CATEGORIES.map(cat => (
                          <SelectItem key={cat} value={cat}>
                            {CATEGORY_LABELS[cat]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                <FieldError errors={[errors.category]} />
              </Field>
            </FieldGroup>
          </div>

          {/* Subtasks */}
          <FieldGroup>
            <Field>
              <FieldLabel className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                Subtasks
              </FieldLabel>

              {fields.length > 0 && (
                <ul className="flex flex-col gap-2 border-l-2 border-muted pl-3 ml-1">
                  {fields.map((field, i) => (
                    <li key={field.id} className="flex items-center gap-2 group">
                      <Controller
                        name={`subtasks.${i}.name`}
                        control={control}
                        render={({ field: subtaskField }) => (
                          <Input
                            {...subtaskField}
                            className="h-8 text-sm"
                            placeholder="Subtask name"
                          />
                        )}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
                        onClick={() => removeSubtask(i)}
                        aria-label={`Remove subtask`}
                      >
                        <X size={14} />
                      </Button>
                    </li>
                  ))}
                </ul>
              )}

              {/* Add New Subtask */}
              <div className="flex items-center gap-2 mt-1">
                <Input
                  ref={newSubtaskRef}
                  value={newSubtaskText}
                  onChange={e => setNewSubtaskText(e.target.value)}
                  onKeyDown={handleNewSubtaskKeyDown}
                  placeholder="Add a subtask..."
                  className="h-8 text-sm"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 shrink-0"
                  onClick={addSubtask}
                  disabled={!newSubtaskText.trim()}
                  aria-label="Add subtask"
                >
                  <Plus size={14} />
                </Button>
              </div>
            </Field>
          </FieldGroup>

          {/* ── Footer ── */}
          <DialogFooter className="sm:justify-between items-center">

            <DeleteTaskButton
              task={task}
              onDeleted={() => onOpenChange(false)}
            />

            <div className="flex items-center justify-end gap-3 ">
              <Button type="button" variant="secondary" onClick={() => onOpenChange(false)} disabled={isPending}>
                Cancel
              </Button>
              <Button type="submit" disabled={isPending || newSubtaskText.trim().length > 0 || !isDirty}>
                {isPending ? (
                  <span className="inline-flex items-center gap-2">
                    <Spinner />
                    Saving...
                  </span>
                ) : newSubtaskText.trim().length > 0 ? (
                  <span> Hit <Kbd className='bg-foreground'>Enter</Kbd> to add subtask </span>
                ) : (
                  <span className="flex items-center gap-2">
                    Save Changes
                  </span>
                )}
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}