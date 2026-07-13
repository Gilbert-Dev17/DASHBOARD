import { cache } from "react";
import { unstable_cache } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { TaskWithSubtasks } from '@/types/dashboard'

export const getTasksByDate = cache(async (userId: string, dateStr: string): Promise<TaskWithSubtasks[]> => {
  const supabase = await createClient();

  return unstable_cache(
    async () => {
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
    },
    [`planner-tasks-${userId}-${dateStr}`],
    { tags: [`tasks-${userId}`, `tasks-${dateStr}`], revalidate: 3600 }
  )();
});

export const getMonthTasksSummary = cache(async (userId: string, startStr: string, endStr: string) => {
  const supabase = await createClient();

  return unstable_cache(
    async () => {
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

      const countsByDate = data?.reduce((acc: Record<string, number>, task) => {
        const date = task.created_for_date
        acc[date] = (acc[date] || 0) + 1
        return acc
      }, {}) || {}

      return Object.entries(countsByDate).map(([date, count]) => ({
        date,
        count
      }));
    },
    [`planner-summary-${userId}-${startStr}-${endStr}`],
    { tags: [`tasks-${userId}`], revalidate: 3600 }
  )();
});