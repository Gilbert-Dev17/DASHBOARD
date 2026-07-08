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
}