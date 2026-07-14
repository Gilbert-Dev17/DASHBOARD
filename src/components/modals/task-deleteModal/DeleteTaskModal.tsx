'use client'

import {useState} from 'react'
import { Trash2 } from 'lucide-react'
import {
  AlertDialog, AlertDialogAction, AlertDialogMedia, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Spinner } from '@/components/ui/spinner'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { useMutation } from '@tanstack/react-query'
import { RemoveTask } from '@/lib/actions/remove-task'

interface DeleteModalProps {
    taskId: string;
    taskName: string;
    onDeleted?: () => void;
}

export const DeleteTaskModal = ({taskId, taskName, onDeleted }: DeleteModalProps) => {
    const [open, setOpen] = useState(false)

    const {mutate: deleteTask, isPending} = useMutation({
        mutationFn: () => RemoveTask(taskId),
        onSuccess: (task) => {
            if (task.success) {
                toast.success(task.message)
                setOpen(false)
                onDeleted?.()
            } else {
                toast.error(task.message)
            }
        },
        onError: (error) => {
            toast.error('Failed to delete task' + error.message)
        }
    });

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          className=" text-destructive hover:bg-destructive/10 hover:text-destructive transition-colors duration-300"
        >
            <Trash2 size={16} />
            {/* Delete */}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent size='sm' >
        <AlertDialogHeader>
          <AlertDialogMedia className="bg-destructive/10 text-destructive dark:bg-destructive/20 dark:text-destructive">
            <Trash2 size={36} />
          </AlertDialogMedia>
          <AlertDialogTitle className="flex flex-col gap-1.5 items-center text-center mt-2">
            <span className="text-xs uppercase tracking-widest text-muted-foreground font-semibold">Delete Task</span>
            <span className='text-accent font-bold text-lg'>{taskName}</span>
          </AlertDialogTitle>
          <AlertDialogDescription className="text-center text-sm mt-2">
            This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="sm:justify-center flex-col sm:flex-row gap-2 mt-4">
          <AlertDialogCancel disabled={isPending} className="mt-0">Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              deleteTask();
            }}
            disabled={isPending}
            className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
          >
            {isPending ? <Spinner className="mr-2" /> : null}
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
