'use server'

import { cacheTag } from "next/cache";
import type { TaskWithSubtasks, WalletSummary } from '@/types/dashboard'
import { getTodayInTimezone } from "@/utils/timezone";
import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

async function fetchCachedHomeData(userId: string, today: string){
  'use cache'
  cacheTag(`tasks-${userId}`);

  const { data: tasks, error } = await supabaseAdmin
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
}


export async function getHomeData(userId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user || user.id !== userId) {
      throw new Error('Unauthorized or invalid user ID');
  }

  const today = getTodayInTimezone()
  return fetchCachedHomeData(user.id, today)
}

async function fetchedCachedWalletData(userId: string){
  'use cache'
  cacheTag(`wallets-${userId}`)

  const { data: wallet, error } = await supabaseAdmin
      .from('wallets')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: true })
    if (error) {
      console.error("Error fetching wallets:", error.message);
      throw error;
    }

    return wallet as WalletSummary[];
}

export async function getWalletData(userId: string) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();

  if (!user || user.id !== userId) {
      throw new Error('Unauthorized or invalid user ID');
  }

  return fetchedCachedWalletData(userId);
}