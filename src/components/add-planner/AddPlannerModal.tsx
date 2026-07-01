'use client'

import { DefaultValues, useFieldArray, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Plus } from 'lucide-react'

import {
  Dialog, DialogContent, DialogDescription,
  DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog'
import { Button }     from '@/components/ui/button'
import { FieldError } from '@/components/ui/field'

import { plannerSchema, type PlannerValues, type TaskRow } from './schemas'
import { TaskRow as TaskRowField } from './task-row'

const EMPTY_TASK: DefaultValues<TaskRow> = {
  name    : '',
  category: undefined,
  time    : '',
}

interface AddPlannerModalProps {
  onSuccess?: (values: PlannerValues) => void
}

export function AddPlannerModal({ onSuccess }: AddPlannerModalProps) {

  const form = useForm<PlannerValues>({
    resolver     : zodResolver(plannerSchema),
    defaultValues: { tasks: [EMPTY_TASK] } as DefaultValues<PlannerValues>,
  })

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name   : 'tasks',
  })

  const tasksRootError = form.formState.errors.tasks?.message

  function onSubmit(values: PlannerValues) {
    // TODO: Supabase insert
    onSuccess?.(values)
    form.reset({ tasks: [EMPTY_TASK] })
  }

  function onReset() {
    form.reset({ tasks: [EMPTY_TASK] })
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="default"
          size="icon"
          className="h-10 w-10 rounded-full transition-all duration-300 hover:scale-105"
          aria-label="Open planner"
        >
          <Plus size={18} strokeWidth={2.5} aria-hidden />
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Plan your day</DialogTitle>
          <DialogDescription>
            Add one or more tasks. Each needs a name, category, and time.
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={form.handleSubmit(onSubmit)}
          noValidate
          aria-label="Planner form"
          className="flex flex-col gap-3"
        >
          {/* Task rows */}
          <div className="flex flex-col gap-2" role="list" aria-label="Task list">
            {fields.map((field, index) => (
              <div key={field.id} role="listitem">
                <TaskRowField
                  control={form.control}
                  index={index}
                  onRemove={() => remove(index)}
                  canRemove={fields.length > 1}
                />
              </div>
            ))}
          </div>

          {tasksRootError && <FieldError>{tasksRootError}</FieldError>}

          <Button
            type="button"
            variant="outline"
            size="sm"
            className="w-full justify-center"
            onClick={() => append(EMPTY_TASK as TaskRow)}
            aria-label="Add another task"
          >
            <Plus size={14} aria-hidden className="mr-1.5" />
            Add another task
          </Button>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onReset} >
              Reset
            </Button>
            <Button type="submit" >
              Save Plan
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}