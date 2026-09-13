import { z } from 'zod'
import { TASK_CATEGORY_OPTIONS } from '@/lib/constants/options'

export const editTaskSchema = z.object({
  task_name: z
    .string()
    .trim()
    .min(1, 'Task name is required.'),
  time: z
    .string()
    .optional()
    .transform(v => v || undefined),
  category: z
    .enum(TASK_CATEGORY_OPTIONS, { message: 'Please select a category.' }),
  subtasks: z
    .array(
      z.object({
        dbId: z.string().nullable(),
        name: z.string().trim().min(1, 'Subtask name cannot be empty.'),
      })
    )
    .optional()
    .default([]),
})

export type EditTaskFormValues = z.infer<typeof editTaskSchema>
