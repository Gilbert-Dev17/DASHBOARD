import { z } from 'zod'
import { TASK_CATEGORIES} from '@/lib/constants/tasks'

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
    .enum(TASK_CATEGORIES, { message: 'Please select a category.' }),
  subtasks: z
    .array(
      z.object({
        id: z.string().nullable(),
        name: z.string().trim().min(1, 'Subtask name cannot be empty.'),
      })
    )
    .optional()
    .default([]),
})

export type EditTaskFormValues = z.infer<typeof editTaskSchema>
