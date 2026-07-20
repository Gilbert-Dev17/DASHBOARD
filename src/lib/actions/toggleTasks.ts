'use server'

import { createClient } from "../supabase/server"
import { updateTag } from "next/cache";

export async function toggleTask(taskId: string, isDone: boolean) {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, message: 'Not authenticated.' }

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

    const { error: subtaskError } = await supabase
        .from("subtasks")
        .update({ is_done: isDone })
        .eq("task_id", taskId);

    if (subtaskError) {
        console.error(subtaskError);
        return { success: false, message: "Task updated, but failed to update subtasks" };
    }

    updateTag(`tasks-${user.id}`);
    updateTag(`planner-tasks=${user.id}`)

    return { success: true, message: "Task is Finished" };
}

export async function toggleSubTask(subtaskId: string, isDone: boolean) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, message: 'Not authenticated.' }

    const { error } = await supabase
        .from('subtasks')
        .update({ is_done: isDone })
        .eq('id', subtaskId)

    if (error) {
        console.error(error);
        return { success: false, message: error.message };
    }

    updateTag(`tasks-${user.id}`)
    updateTag(`planner-tasks-${user.id}`)

    return { success: true, message: "Task is Finished" };
}