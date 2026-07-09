import { TASK_CATEGORIES, type TaskCategory } from '@/components/modals/add-planner/constants'

export interface ParsedTask {
  name: string
  category: TaskCategory | null
  time: string | null // 24-hour "HH:MM" format
  subtasks: string[]
}

/**
 * Convert 12-hour time string to 24-hour format.
 * Handles: "10:00", "3:00pm", "3:00 PM", "15:30"
 */
function to24Hour(raw: string): string {
  const match = raw.match(/^(\d{1,2}):(\d{2})\s*(am|pm)?$/i)
  if (!match) return raw

  let h = parseInt(match[1], 10)
  const m = match[2]
  const period = match[3]?.toLowerCase()

  if (period === 'pm' && h !== 12) h += 12
  if (period === 'am' && h === 12) h = 0

  return `${h.toString().padStart(2, '0')}:${m}`
}

/**
 * Parse multi-line quick-add input into structured tasks.
 *
 * Format:
 *   Task name @category HH:MM
 *     Subtask name  (indented with 2+ spaces or tab)
 *
 * Rules:
 * - @category is matched against TASK_CATEGORIES (case-insensitive)
 * - Time supports 10:00, 3:00pm, 15:30 formats (optional)
 * - Indented lines become subtasks of the preceding task
 * - Empty lines are skipped
 */
export function parseTaskLines(input: string): ParsedTask[] {
  const lines = input.split('\n')
  const tasks: ParsedTask[] = []
  let currentTask: ParsedTask | null = null

  for (const line of lines) {
    if (line.trim() === '') continue

    const isSubtask = /^\s{2,}/.test(line) || line.startsWith('\t')

    if (isSubtask && currentTask) {
      currentTask.subtasks.push(line.trim())
      continue
    }

    // Parse a new task line
    let remaining = line.trim()

    // 1. Extract @category
    let category: TaskCategory | null = null
    const catMatch = remaining.match(/@(\w+)/)
    if (catMatch) {
      const candidate = catMatch[1].toLowerCase()
      if ((TASK_CATEGORIES as readonly string[]).includes(candidate)) {
        category = candidate as TaskCategory
      }
      remaining = remaining.replace(catMatch[0], '')
    }

    // 2. Extract time (e.g. 10:00, 3:00pm, 15:30)
    let time: string | null = null
    const timeMatch = remaining.match(/\b(\d{1,2}:\d{2}\s*(?:am|pm)?)\b/i)
    if (timeMatch) {
      time = to24Hour(timeMatch[1].trim())
      remaining = remaining.replace(timeMatch[0], '')
    }

    // 3. Clean up leftover whitespace for the name
    const name = remaining.replace(/\s+/g, ' ').trim()

    currentTask = { name, category, time, subtasks: [] }
    tasks.push(currentTask)
  }

  return tasks
}

/**
 * Sort parsed tasks: timed tasks first (ascending by time), timeless tasks last.
 */
export function sortParsedTasks(tasks: ParsedTask[]): ParsedTask[] {
  return [...tasks].sort((a, b) => {
    if (a.time && b.time) return a.time.localeCompare(b.time)
    if (a.time && !b.time) return -1
    if (!a.time && b.time) return 1
    return 0
  })
}
