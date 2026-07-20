'use server'

import { cacheTag } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { TaskWithSubtasks } from '@/types/dashboard'
import { supabaseAdmin } from "@/lib/supabase/admin";
import { getUser } from "@/lib/auth/get-user";

async function fetchCachedTasksByDate(userId: string, dateStr: string ){
  'use cache'
  cacheTag(`tasks-${userId}`)

  const {data: tasks, error } = await supabaseAdmin
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
    .order('time', {ascending: true, nullsFirst: false});

    if (error) {
      console.error(`Error fetching tasks for ${dateStr}:`, error.message);
      throw error;
    }

    return (tasks ?? []) as unknown as TaskWithSubtasks[];
}

export async function getTasksByDate(userId: string, dateStr: string){
  const user = await getUser();

  if (!user || user.id !== userId){
    throw new Error('Unauthorized or invalid user ID');
  }

  return fetchCachedTasksByDate(userId, dateStr)
}

async function fetchCachedMonthTasksSummary(userId: string, startStr: string, endStr: string){
  'use cache'
  cacheTag(`tasks-${userId}`)

  const { data, error } = await supabaseAdmin
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
}

export async function getMonthTasksSummary(userId: string, startStr: string, endStr: string) {

  const user = await getUser();

  if (!user|| user.id !== userId ){
    throw new Error('Unauthorized or invalid user ID');
  }

  return fetchCachedMonthTasksSummary(userId, startStr, endStr)
}