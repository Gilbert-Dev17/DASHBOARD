import { createClient } from "@/lib/supabase/server";
import type { TaskWithSubtasks } from '@/types/dashboard'
import { getTodayInTimezone } from "@/hooks/getTimezone";

export async function getTasksByDate(userId: string, dateStr: string): Promise<TaskWithSubtasks[]> {
  const supabase = await createClient();

  const { data: tasks, error } = await supabase
    .from('tasks')
    .select(`
      id,
      user_id,
      task_name,
      time,
      is_done,
      created_for_date,
      subtasks (
        id,
        is_done,
        subtask_name
      ),
      task_category:task_categories!tasks_task_category_id_fkey (
        id,
        name
      )`)
    .eq('user_id', userId)
    .eq('created_for_date', dateStr)
    .order('time', { ascending: true, nullsFirst: false });

  if (error) {
    console.error(`Error fetching tasks for ${dateStr}:`, error.message);
    throw error;
  }

  return (tasks ?? []) as unknown as TaskWithSubtasks[];
}

// Fetches a summary of tasks for a month (used for dots on the calendar)
export async function getMonthTasksSummary(userId: string, startStr: string, endStr: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('tasks')
    .select('created_for_date')
    .eq('user_id', userId)
    .gte('created_for_date', startStr)
    .lte('created_for_date', endStr);

  if (error) {
    console.error("Error fetching month summary:", error.message);
    return [];
  }

  // Extract unique dates that have at least one task
  const datesWithTasks = Array.from(new Set(data?.map(t => t.created_for_date) || []));
  return datesWithTasks;
}