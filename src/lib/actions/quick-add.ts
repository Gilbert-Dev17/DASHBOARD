'use server'

import { createClient } from '../supabase/server'
import { updateTag } from 'next/cache'
import { ParsedTask } from '@/utils/parseTaskLines'
import { getTodayInTimezone } from '@/utils/timezone'
import { MAX_QUICK_ADD_TASKS, DATE_REGEX } from '@/lib/constants/options'

export async function submitQuickAddTasks(tasks: ParsedTask[], targetDate?: string) {

  const today = (targetDate && DATE_REGEX.test(targetDate)) ? targetDate : getTodayInTimezone();

  if (!tasks || tasks.length === 0) {
    return { success: false, message: 'No tasks to add.' }
  }

  if (tasks.length > MAX_QUICK_ADD_TASKS) {
    return { success: false, message: `Cannot add more than ${MAX_QUICK_ADD_TASKS} tasks at once.` }
  }

  const sanitizedTasks = tasks.map(t => ({
    ...t,
    name: t.name.slice(0, 500).trim(),
    category: t.category?.slice(0, 100).trim() || null,
    subtasks: t.subtasks.map(s => s.slice(0, 500).trim()).filter(Boolean),
  }));

  const supabase = await createClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return { success: false, message: 'You must be logged in to add tasks.' }
  }

  try {
    const categoryNames = Array.from(new Set(sanitizedTasks.map(t => t.category).filter(Boolean))) as string[]
    const categoryMap = new Map<string, string>() // name -> id

    if (categoryNames.length > 0) {
      const { data: existingCategories, error: catError } = await supabase
        .from('task_categories')
        .select('id, name')
        .eq('user_id', user.id)
        .in('name', categoryNames)

      if (catError) throw new Error('Failed to process categories.')

      const existingNames = new Set(existingCategories?.map(c => c.name) || [])
      existingCategories?.forEach(c => categoryMap.set(c.name, c.id))

      const missingNames = categoryNames.filter(name => !existingNames.has(name))
      if (missingNames.length > 0) {
        const { data: newCategories, error: insertCatError } = await supabase
          .from('task_categories')
          .insert(missingNames.map(name => ({ name, user_id: user.id })))
          .select('id, name')

        if (insertCatError) throw new Error('Failed to create categories.')
        newCategories?.forEach(c => categoryMap.set(c.name, c.id))
      }
    }

    const tasksToInsert = sanitizedTasks.map(t => ({
      user_id: user.id,
      task_name: t.name,
      task_category_id: t.category ? categoryMap.get(t.category) : null,
      time: t.time || null,
      is_done: false,
      created_for_date: today,
    }))

    const { data: insertedTasks, error: tasksError } = await supabase
      .from('tasks')
      .insert(tasksToInsert)
      .select('id, task_name')

    if (tasksError) throw new Error('Failed to save tasks.')

    const subtasksToInsert: { task_id: string, subtask_name: string, is_done: boolean }[] = []

    sanitizedTasks.forEach((parsedTask, index) => {
      if (parsedTask.subtasks.length > 0) {
        const insertedTask = insertedTasks?.[index]
        if (insertedTask) {
          parsedTask.subtasks.forEach(subName => {
            subtasksToInsert.push({
              task_id: insertedTask.id,
              subtask_name: subName,
              is_done: false
            })
          })
        }
      }
    })

    if (subtasksToInsert.length > 0) {
      const { error: subtasksError } = await supabase
        .from('subtasks')
        .insert(subtasksToInsert)

      if (subtasksError) throw new Error('Failed to save subtasks.')
    }

    if(process.env.NODE_ENV === 'development'){
      console.log(`[data]`, insertedTasks, subtasksToInsert )
    }

    updateTag(`tasks-${user.id}`)
    updateTag(`planner-tasks-${user.id}`)

    return { success: true, message: 'Tasks successfully added!' }
  } catch (error: unknown) {
    console.error('Quick Add Error:', error)
    return { success: false, message: error instanceof Error ? error.message : 'An unexpected error occurred.' }
  }
}
