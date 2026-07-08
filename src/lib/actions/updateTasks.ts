'use server'

import { createClient } from "../supabase/server"
import { revalidatePath } from "next/cache";

export async function toggleTask(taskId: string, isDone: boolean) {

  const supabase = await createClient();

  const { data, error, status, statusText } = await supabase
  .from("tasks")
  .update({ is_done: isDone })
  .eq("id", taskId)
  .select();

    {process.env.NODE_ENV === 'development'
        console.log({
            taskId,
            isDone,
            data,
            error,
            status,
            statusText,
        });
    }

  if (error) {
    console.error(error);
    return { success: false, message: error.message };
  }

//   // Cascade the update down to all nested subtasks
//   const { error: subtaskError } = await supabase
//     .from("subtasks")
//     .update({ is_done: isDone })
//     .eq("task_id", taskId);

//   if (subtaskError) {
//     console.error(subtaskError);
//     return { success: false, message: "Task updated, but failed to update subtasks" };
//   }

   return { success: true, message: "Task is Finished" };
}

export async function toggleSubTask(subtaskId: string, isDone: boolean) {
    const supabase = await createClient()

    const { error } = await supabase
        .from('subtasks')
        .update({ is_done: isDone })
        .eq('id', subtaskId)

    if (error) {
        console.error(error);
        return { success: false, message: error.message };
    }

    revalidatePath('/home')

    return { success: true, message: "Task is Finished" };
}