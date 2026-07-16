'use server'

import { cacheTag, cacheLife } from "next/cache";
import type { TaskWithSubtasks, WalletSummary, WalletHistory } from '@/types/dashboard'
import { getTodayInTimezone } from "@/utils/timezone";
import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { getUser } from "@/lib/auth/get-user";

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
  const user = await getUser();

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
  const user = await getUser();

  if (!user || user.id !== userId) {
      throw new Error('Unauthorized or invalid user ID');
  }

  return fetchedCachedWalletData(userId);
}

// * Networth call
async function fetchCachedHistoricalSnapshots(userId: string) {
  'use cache'
  cacheLife('hours');
  cacheTag(`snapshots-${userId}`);

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const targetDate = thirtyDaysAgo.toISOString();

  const { data, error } = await supabaseAdmin
    .from('wallet_snapshots')
    .select('*')
    .eq('user_id', userId)
    .gte('recorded_at', targetDate)
    .order('recorded_at', { ascending: true });

  if (error) {
    console.error("Error fetching snapshots:", error.message);
    return [];
  }

  // Grab the oldest snapshot for each wallet in this window
  const oldestSnapshots = new Map<string, WalletHistory>();
  for (const snap of (data || [])) {
    if (!oldestSnapshots.has(snap.wallet_id)) {
      oldestSnapshots.set(snap.wallet_id, snap);
    }
  }

  return Array.from(oldestSnapshots.values());
}

export async function getHistoricalSnapshots(userId: string) {
  const user = await getUser();

  if (!user || user.id !== userId) {
      throw new Error('Unauthorized or invalid user ID');
  }

  return fetchCachedHistoricalSnapshots(userId);
}