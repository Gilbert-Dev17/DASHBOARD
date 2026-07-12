'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

interface SubtaskUpdate {
  id: string
  subtask_name: string
}

interface EditTaskPayload {
  taskId: string
  task_name: string
  time: string | null
  category_name: string | null
  subtasks: {
    updated: SubtaskUpdate[]
    added: string[]
    deleted: string[]
  }
}

export async function submitTaskEdit(payload: EditTaskPayload) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false, message: 'Not authenticated.' }

    // 1. Resolve category ID if a category name was provided
    let categoryId: string | null = null
    if (payload.category_name) {
      const { data: catRow } = await supabase
        .from('task_categories')
        .select('id')
        .eq('user_id', user.id)
        .eq('name', payload.category_name)
        .maybeSingle()

      if (catRow) {
        categoryId = catRow.id
      } else {
        // Create the category if it doesn't exist
        const { data: newCat, error: catError } = await supabase
          .from('task_categories')
          .insert({ user_id: user.id, name: payload.category_name })
          .select('id')
          .single()

        if (catError) throw catError
        categoryId = newCat.id
      }
    }

    // 2. Update the task itself
    const { error: taskError } = await supabase
      .from('tasks')
      .update({
        task_name: payload.task_name,
        time: payload.time,
        task_category_id: categoryId,
      })
      .eq('id', payload.taskId)
      .eq('user_id', user.id)

    if (taskError) throw taskError

    // 3. Update existing subtasks
    for (const sub of payload.subtasks.updated) {
      const { error } = await supabase
        .from('subtasks')
        .update({ subtask_name: sub.subtask_name })
        .eq('id', sub.id)

      if (error) throw error
    }

    // 4. Insert new subtasks
    if (payload.subtasks.added.length > 0) {
      const newSubtasks = payload.subtasks.added.map(name => ({
        task_id: payload.taskId,
        subtask_name: name,
        is_done: false,
      }))

      const { error } = await supabase
        .from('subtasks')
        .insert(newSubtasks)

      if (error) throw error
    }

    // 5. Delete removed subtasks
    if (payload.subtasks.deleted.length > 0) {
      const { error } = await supabase
        .from('subtasks')
        .delete()
        .in('id', payload.subtasks.deleted)

      if (error) throw error
    }

    revalidatePath('/home')
    revalidatePath('/planner')

    return { success: true, message: 'Task updated successfully!' }
  } catch (error: any) {
    console.error('Edit Task Error:', error)
    return { success: false, message: error.message || 'An unexpected error occurred.' }
  }
}
