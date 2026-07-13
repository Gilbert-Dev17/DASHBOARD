'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

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
        if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
          console.error('Dashboard realtime channel failed:', status);
          toast.error('Realtime connection lost', {
            description: 'Live updates are currently unavailable. Please refresh the page if this persists.',
          });
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