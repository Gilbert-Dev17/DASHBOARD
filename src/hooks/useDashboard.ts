'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export function useDashboard() {
  const [supabase] = useState(() => createClient());
  const router = useRouter();

  useEffect(() => {
    const channel = supabase
      .channel('dashboard-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tasks' }, () => {
        router.refresh();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'subtasks' }, () => {
        router.refresh();
      })
      .subscribe((status) => {
        if (process.env.NODE_ENV === 'development') {
          if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
            console.error('Dashboard realtime channel failed:', status);
          }
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