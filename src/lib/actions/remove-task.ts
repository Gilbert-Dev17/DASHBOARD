'use server'

import { createClient } from "../supabase/server"
import { updateTag } from "next/cache"
import { withAuth } from "@/lib/auth/with-auth"

export const RemoveTask = withAuth(async (user, taskId: string) => {

    const supabase = await createClient();

    const { error} = await supabase
        .from('tasks')
        .delete()
        .eq('id',taskId)
        .eq('user_id', user.id)

      updateTag(`tasks-${user.id}`)
      updateTag(`planner-tasks-${user.id}`)

    if (error) {
      console.error('Error deleting task:', error)
      return { success: false, message: error.message }
    }

    return { success: true, message: 'Task deleted successfully!' }
})