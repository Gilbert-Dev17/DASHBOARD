import { z } from 'zod'
import { TASK_CATEGORIES } from './constants'

export const taskRowSchema = z.object({
  name    : z.string().min(1, 'Task name is required'),
  category: z.enum(TASK_CATEGORIES, { message: 'Select a category' }),
  time    : z
    .string()
    .min(1, 'Time is required')
    .regex(/^\d{2}:\d{2}$/, 'Enter a valid time'),
})

export const plannerSchema = z.object({
  // min(1) means the array itself must have at least one row
  tasks: z.array(taskRowSchema).min(1, 'Add at least one task'),
})

export type TaskRow       = z.infer<typeof taskRowSchema>
export type PlannerValues = z.infer<typeof plannerSchema>