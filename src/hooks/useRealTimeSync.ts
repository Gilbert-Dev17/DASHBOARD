'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { useSyncStatus } from '@/contexts/SyncStatusContext'

export function useRealTimeSync() {
  const [supabase] = useState(() => createClient());
  const router = useRouter();
  const { setSyncStatus, setLastSyncedAt } = useSyncStatus()

  useEffect(() => {
    let syncTimeout: NodeJS.Timeout;

    const handleSync = () => {
      setSyncStatus('syncing')
      setLastSyncedAt(new Date())
      router.refresh()
      
      // Clear any existing timeout so rapid events don't cancel the pulse prematurely
      if (syncTimeout) clearTimeout(syncTimeout)
      
      // Reset back to idle after a brief pulse
      syncTimeout = setTimeout(() => {
        setSyncStatus('idle')
      }, 1500)
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
      .subscribe((status) => {
        if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
          console.error('Dashboard realtime channel failed:', status);
          setSyncStatus('error')
          toast.error('Realtime connection lost', {
            description: 'Live updates are currently unavailable. Please refresh the page if this persists.',
          });
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, router, setSyncStatus, setLastSyncedAt]);

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