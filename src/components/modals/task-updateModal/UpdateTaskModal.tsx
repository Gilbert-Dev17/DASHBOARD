'use client'

import { useState, useRef, type KeyboardEvent } from 'react'
import { useMutation } from '@tanstack/react-query'
import { X, Plus } from 'lucide-react'
import { TASK_CATEGORIES, CATEGORY_LABELS, type TaskCategory } from '@/lib/constants/tasks'
import { submitTaskEdit } from '@/lib/actions/edit-task'
import { TaskWithSubtasks } from '@/types/dashboard'
import {
  Dialog, DialogContent, DialogDescription,
  DialogHeader, DialogTitle,
} from '@/components/ui/dialog'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { Spinner } from '@/components/ui/spinner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'

interface UpdateTaskModalProps {
  task: TaskWithSubtasks
  open: boolean
  onOpenChange: (open: boolean) => void
}

interface SubtaskState {
  id: string | null  // null = newly added
  name: string
}

export const UpdateTaskModal = ({ task, open, onOpenChange }: UpdateTaskModalProps) => {
  // ── Form State ──
  const [taskName, setTaskName] = useState(task.task_name)
  const [time, setTime] = useState(task.time ? task.time.slice(0, 5) : '') // 'HH:MM'
  const [category, setCategory] = useState<string>(task.task_category?.name || '')
  const [subtasks, setSubtasks] = useState<SubtaskState[]>(
    task.subtasks?.map(st => ({ id: st.id, name: st.subtask_name })) || []
  )
  const [deletedSubtaskIds, setDeletedSubtaskIds] = useState<string[]>([])
  const [newSubtaskText, setNewSubtaskText] = useState('')
  const newSubtaskRef = useRef<HTMLInputElement>(null)

  // ── Reset state when a different task is passed in ──
  const resetForm = () => {
    setTaskName(task.task_name)
    setTime(task.time ? task.time.slice(0, 5) : '')
    setCategory(task.task_category?.name || '')
    setSubtasks(task.subtasks?.map(st => ({ id: st.id, name: st.subtask_name })) || [])
    setDeletedSubtaskIds([])
    setNewSubtaskText('')
  }

  // ── Mutation ──
  const { mutate: editTask, isPending } = useMutation({
    mutationFn: () => {
      const updated = subtasks
        .filter(st => st.id !== null)
        .map(st => ({ id: st.id!, subtask_name: st.name }))

      const added = subtasks
        .filter(st => st.id === null)
        .map(st => st.name)

      return submitTaskEdit({
        taskId: task.id,
        task_name: taskName.trim(),
        time: time ? `${time}:00` : null,
        category_name: category || null,
        subtasks: { updated, added, deleted: deletedSubtaskIds },
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
    setSubtasks(prev => [...prev, { id: null, name: trimmed }])
    setNewSubtaskText('')
    requestAnimationFrame(() => newSubtaskRef.current?.focus())
  }

  const removeSubtask = (index: number) => {
    const removed = subtasks[index]
    if (removed.id) {
      setDeletedSubtaskIds(prev => [...prev, removed.id!])
    }
    setSubtasks(prev => prev.filter((_, i) => i !== index))
  }

  const updateSubtaskName = (index: number, name: string) => {
    setSubtasks(prev => prev.map((st, i) => i === index ? { ...st, name } : st))
  }

  const handleNewSubtaskKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      addSubtask()
    }
  }

  const handleSubmit = () => {
    if (!taskName.trim()) {
      toast.error('Task name is required.')
      return
    }
    if (!category) {
      toast.error('Please select a category.')
      return
    }
    editTask()
  }

  return (
    <Dialog open={open} onOpenChange={(value) => {
      onOpenChange(value)
      if (!value) resetForm()
    }}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-bold">Edit Task</DialogTitle>
          <DialogDescription>
            Update the task details below.
          </DialogDescription>
        </DialogHeader>

        {/* ── Form Fields ── */}
        <div className="flex flex-col gap-5 mt-2">

          {/* Task Name */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="edit-task-name" className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Task Name
            </Label>
            <Input
              id="edit-task-name"
              value={taskName}
              onChange={e => setTaskName(e.target.value)}
              placeholder="Enter task name"
              autoFocus
            />
          </div>

          {/* Time & Category Row */}
          <div className="grid grid-cols-2 gap-4">
            {/* Time */}
            <div className="flex flex-col gap-2">
              <Label htmlFor="edit-task-time" className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                Time
              </Label>
              <Input
                id="edit-task-time"
                type="time"
                value={time}
                onChange={e => setTime(e.target.value)}
              />
            </div>

            {/* Category */}
            <div className="flex flex-col gap-2">
              <Label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                Category
              </Label>
              <Select value={category} onValueChange={setCategory}>
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
            </div>
          </div>

          {/* Subtasks */}
          <div className="flex flex-col gap-2">
            <Label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Subtasks
            </Label>

            {subtasks.length > 0 && (
              <ul className="flex flex-col gap-2 border-l-2 border-muted pl-3 ml-1">
                {subtasks.map((st, i) => (
                  <li key={st.id ?? `new-${i}`} className="flex items-center gap-2 group">
                    <Input
                      value={st.name}
                      onChange={e => updateSubtaskName(i, e.target.value)}
                      className="h-8 text-sm"
                      placeholder="Subtask name"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
                      onClick={() => removeSubtask(i)}
                      aria-label={`Remove subtask "${st.name}"`}
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
          </div>
        </div>

        {/* ── Footer ── */}
        <div className="flex items-center justify-end gap-3 mt-4">
          <Button variant="ghost" onClick={() => onOpenChange(false)} disabled={isPending}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isPending || !taskName.trim()}>
            {isPending ? (
              <span className="inline-flex items-center gap-2">
                <Spinner />
                Saving...
              </span>
            ) : (
              'Save Changes'
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}