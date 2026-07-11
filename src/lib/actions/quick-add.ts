'use server'

import { createClient } from '../supabase/server'
import { revalidatePath } from 'next/cache'
import { ParsedTask } from '@/utils/parseTaskLines'
import { getTodayInTimezone } from '@/hooks/getTimezone'

export async function submitQuickAddTasks(tasks: ParsedTask[], targetDate?: string) {

  const today = targetDate || getTodayInTimezone();

  if (!tasks || tasks.length === 0) {
    return { success: false, message: 'No tasks to add.' }
  }

  const supabase = await createClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return { success: false, message: 'You must be logged in to add tasks.' }
  }

  try {
    const categoryNames = Array.from(new Set(tasks.map(t => t.category).filter(Boolean))) as string[]
    const categoryMap = new Map<string, string>() // name -> id

    if (categoryNames.length > 0) {
      const { data: existingCategories, error: catError } = await supabase
        .from('task_categories')
        .select('id, name')
        .eq('user_id', user.id)
        .in('name', categoryNames)

      if (catError) throw new Error(`Failed to fetch categories: ${catError.message}`)

      const existingNames = new Set(existingCategories?.map(c => c.name) || [])
      existingCategories?.forEach(c => categoryMap.set(c.name, c.id))

      const missingNames = categoryNames.filter(name => !existingNames.has(name))
      if (missingNames.length > 0) {
        const { data: newCategories, error: insertCatError } = await supabase
          .from('task_categories')
          .insert(missingNames.map(name => ({ name, user_id: user.id })))
          .select('id, name')

        if (insertCatError) throw new Error(`Failed to create categories: ${insertCatError.message}`)
        newCategories?.forEach(c => categoryMap.set(c.name, c.id))
      }
    }

    const tasksToInsert = tasks.map(t => ({
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

    if (tasksError) throw new Error(`Failed to insert tasks: ${tasksError.message}`)

    const subtasksToInsert: { task_id: string, subtask_name: string, is_done: boolean }[] = []

    tasks.forEach(parsedTask => {
      if (parsedTask.subtasks.length > 0) {
        const insertedTask = insertedTasks?.find(t => t.task_name === parsedTask.name)
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

      if (subtasksError) throw new Error(`Failed to insert subtasks: ${subtasksError.message}`)
    }

    console.log(`[data]`, insertedTasks, subtasksToInsert )

    revalidatePath('/home')

    return { success: true, message: 'Tasks added successfully!' }
  } catch (error: any) {
    console.error('Quick Add Error:', error)
    return { success: false, message: error.message || 'An unexpected error occurred.' }
  }
}
