'use client'

import { Control, Controller } from 'react-hook-form'
import { Trash2 } from 'lucide-react'

import { Input }   from '@/components/ui/input'
import { Button }  from '@/components/ui/button'
import { Field, FieldError } from '@/components/ui/field'
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue,
} from '@/components/ui/select'

import { TASK_CATEGORIES, CATEGORY_LABELS } from './constants'
import type { PlannerValues } from './schemas'

interface TaskRowProps {
  control   : Control<PlannerValues>
  index     : number
  onRemove  : () => void
  canRemove : boolean
}

export function TaskRow({ control, index, onRemove, canRemove }: TaskRowProps) {
  return (
    // role="group" groups the three fields under one implicit row label
    <div
      role="group"
      aria-label={`Task ${index + 1}`}
      className="flex items-start gap-2 rounded-lg bg-accent p-2"
    >

      {/* ── Task name ── */}
      <Controller
        control={control}
        name={`tasks.${index}.name`}
        render={({ field, fieldState }) => (
          <Field data-invalid={!!fieldState.error} className="min-w-0 flex-1">
            <Input
              {...field}
              placeholder="Task name..."
              aria-label="Task name"
              aria-invalid={!!fieldState.error}
              className="border-0 bg-transparent focus-visible:ring-0"
            />
            <FieldError errors={[fieldState.error]} />
          </Field>
        )}
      />

      {/* ── Category ── */}
      <Controller
        control={control}
        name={`tasks.${index}.category`}
        render={({ field, fieldState }) => (
          <Field data-invalid={!!fieldState.error} className="w-36 shrink-0">
            <Select value={field.value} onValueChange={field.onChange}>
              <SelectTrigger
                aria-label="Select category"
                aria-invalid={!!fieldState.error}
              >
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                {TASK_CATEGORIES.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {CATEGORY_LABELS[cat]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FieldError errors={[fieldState.error]} />
          </Field>
        )}
      />

      {/* ── Time ── */}
      <Controller
        control={control}
        name={`tasks.${index}.time`}
        render={({ field, fieldState }) => (
          <Field data-invalid={!!fieldState.error} className="w-32 shrink-0">
            <Input
              {...field}
              type="time"
              aria-label="Task time"
              aria-invalid={!!fieldState.error}
              className="border-0 bg-transparent focus-visible:ring-0"
            />
            <FieldError errors={[fieldState.error]} />
          </Field>
        )}
      />

      {/* ── Remove row ── */}
      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={onRemove}
        disabled={!canRemove}
        aria-label={`Remove task ${index + 1}`}
        className="mt-0.5 shrink-0"
      >
        <Trash2 size={16} aria-hidden />
      </Button>

    </div>
  )
}