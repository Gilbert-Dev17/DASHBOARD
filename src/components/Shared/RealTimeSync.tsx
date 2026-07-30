'use client'

import { useRealTimeSync } from '@/hooks/useRealTimeSync'

export function RealtimeSync() {
  useRealTimeSync();
  return null; // This component is invisible, it just runs the hook
}