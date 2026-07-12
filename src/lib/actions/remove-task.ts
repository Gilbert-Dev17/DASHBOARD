'use server'

import { createClient } from "../supabase/server"
import { getUser } from "../auth/get-user"
import { revalidatePath } from "next/cache"

export async function RemoveTask(taskId: string) {

    const user = await getUser();
    if (!user) return { success: false, message: 'Not authenticated.' }

    const supabase = await createClient();

    const { error} = await supabase
        .from('tasks')
        .delete()
        .eq('id',taskId)
        .eq('user_id', user.id)

    revalidatePath('/home')
    revalidatePath('/planner')


    if (error) {
      console.error('Error deleting task:', error)
      return { success: false, message: error.message }
    }

    return { success: true, message: 'Task deleted successfully!' }
}