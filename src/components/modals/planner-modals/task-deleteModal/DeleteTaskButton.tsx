'use client'

import { Trash2, Undo2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { RemoveTask } from '@/lib/actions/remove-task'
import { UndoCountdown } from './UndoDeleteToast'
import type { TaskWithSubtasks } from '@/types/dashboard'

const UNDO_DURATION = 5000

interface DeleteTaskButtonProps {
  task: TaskWithSubtasks
  onDeleted?: () => void
}

export const DeleteTaskButton = ({ task, onDeleted }: DeleteTaskButtonProps) => {

  const handleDelete = () => {
    onDeleted?.()

    window.dispatchEvent(new CustomEvent('optimistic-task-delete', {
      detail: { taskId: task.id, task }
    }))

    let cancelled = false
    const timer = setTimeout(async () => {
      if (cancelled) return
      const result = await RemoveTask(task.id)
      if (!result.success) {
        toast.error('Failed to delete: ' + result.message)
        window.dispatchEvent(new CustomEvent('optimistic-task-restore', {
          detail: { task }
        }))
      }
    }, UNDO_DURATION)

    // 4. Show the undo toast using Sonner's native API
    toast(`"${task.task_name}" deleted`, {
      description: <UndoCountdown />,
      duration: UNDO_DURATION + 200, // slight buffer so toast outlasts the timer
      action: {
        label: <span className='flex items-center'>Undo {<Undo2 size={12} />}</span>,
        onClick: () => {
          cancelled = true
          clearTimeout(timer)
          window.dispatchEvent(new CustomEvent('optimistic-task-restore', {
            detail: { task }
          }))
        },
      },
    })
  }

  return (
    <Button
      type="button"
      variant="ghost"
      onClick={handleDelete}
      className="text-destructive hover:bg-destructive/10 hover:text-destructive transition-colors duration-300"
    >
      <Trash2 size={16} />
    </Button>
  )
}
