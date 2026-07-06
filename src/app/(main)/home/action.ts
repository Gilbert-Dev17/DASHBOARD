import { createClient } from "@/lib/supabase/server";
import type { TaskWithSubtasks } from '@/types/dashboard'

const APP_TIMEZONE = 'Asia/Manila';

export function getTodayInTimezone(timeZone: string = APP_TIMEZONE, now: Date = new Date()): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone, year: 'numeric', month: '2-digit', day: '2-digit' }).format(now);
}

export async function getHomeData(userId: string): Promise<TaskWithSubtasks[]> {
  const supabase = await createClient();
  const today = getTodayInTimezone();

  const { data: tasks, error } = await supabase
    .from('tasks')
    .select(`
      id,
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
      )
    `)
    .eq('user_id', userId)
    .eq('created_for_date', today)
    .order('time', { ascending: true, nullsFirst: false });

  if (error) {
    console.error("Error fetching tasks:", error.message);
    throw error;
  }

  return (tasks ?? []) as unknown as TaskWithSubtasks[];
}