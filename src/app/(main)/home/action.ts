import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import type { TaskWithSubtasks, WalletSummary } from '@/types/dashboard'
import { getTodayInTimezone } from "@/utils/timezone";

export const getHomeData = cache(async (userId: string): Promise<TaskWithSubtasks[]> => {
  const supabase = await createClient();
  const today = getTodayInTimezone();

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
    .eq('created_for_date', today)
    .order('time', { ascending: true, nullsFirst: false });

  if (error) {
    console.error("Error fetching tasks:", error.message);
    throw error;
  }

  return (tasks ?? []) as unknown as TaskWithSubtasks[];
});

export const getWalletData = cache(async (userId: string): Promise<WalletSummary[]> => {
  const supabase = await createClient();

  const { data: wallet, error } = await supabase
    .from('wallets')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: true })

  if (error) {
    console.error("Error fetching wallets:", error.message);
    throw error;
  }

  return wallet as WalletSummary[];
});