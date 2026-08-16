'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useQueryClient } from '@tanstack/react-query'
import {useSyncStore} from '@/hooks/syncStore'

export function useRealTimeSync() {
  const [supabase] = useState(() => createClient());
  const router = useRouter();
  const queryClient = useQueryClient();
  const { setSyncing, setSynced } = useSyncStore()

  useEffect(() => {
    const handleSync = () => {
      setSyncing();

      router.refresh();
      queryClient.invalidateQueries();

      setTimeout(() => {
        setSynced();
      }, 1500);
    }

    const channel = supabase
      .channel('dashboard-changes')
      // Profiles Table
      .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, handleSync)
      // Schedule & Home Tables
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tasks' }, handleSync)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'subtasks' }, handleSync)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'daily_notes' }, handleSync)
      // Finance Tables
      .on('postgres_changes', { event: '*', schema: 'public', table: 'transactions' }, handleSync)
      .on('postgres_changes', {event: '*', schema: 'public', table: 'expense_categories'}, handleSync)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'wallets' }, handleSync)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'wallet_snapshots' }, handleSync)
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, router, queryClient]);

  // The "Midnight Refresh" Pattern
  // Automatically fetches the next day's data the exact second the clock strikes 12:00 AM
  useEffect(() => {
    const now = new Date();
    const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
    const msUntilMidnight = tomorrow.getTime() - now.getTime();

    const timeoutId = setTimeout(() => {
      console.log('Midnight reached. Fetching new dashboard data...');
      router.refresh();
    }, msUntilMidnight);

    return () => clearTimeout(timeoutId);
  }, [router]);
}