export const TASK_CATEGORIES = ['routine', 'health', 'work'] as const

export type TaskCategory = (typeof TASK_CATEGORIES)[number]

export const CATEGORY_LABELS: Record<TaskCategory, string> = {
  routine : 'Routine',
  health  : 'Health',
  work    : 'Work',
}