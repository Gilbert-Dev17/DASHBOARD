'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

export function useRealTimeSync() {
  const [supabase] = useState(() => createClient());
  const router = useRouter();

    useEffect(() => {
    const channel = supabase
      .channel('dashboard-changes')
      // Schedule & Home Tables
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tasks' }, () => router.refresh())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'subtasks' }, () => router.refresh())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'daily_notes' }, () => router.refresh())
      // Finance Tables
      .on('postgres_changes', { event: '*', schema: 'public', table: 'transactions' }, () => router.refresh())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'wallets' }, () => router.refresh())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'wallet_snapshots' }, () => router.refresh())
      .subscribe((status) => {
        if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
          console.error('Dashboard realtime channel failed:', status);
          // (Keep your existing toast error here)
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, router]);

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