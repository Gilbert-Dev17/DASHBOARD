'use client'

import { useSyncStore } from '@/hooks/syncStore'
import { cn } from '@/lib/utils'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

export function SyncIndicator({ className }: { className?: string }) {
  const status = useSyncStore((s) => s.status)
  const lastSynced = useSyncStore((s) => s.lastSynced)

  let indicatorColor = 'bg-muted' // idle/connected but no activity
  if (status === 'syncing') {
    indicatorColor = 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]'
  } else if (status === 'error') {
    indicatorColor = 'bg-rose-500'
  }

  const tooltipText = status === 'syncing'
    ? 'Syncing changes...'
    : status === 'error'
    ? 'Connection lost'
    : lastSynced
    ? `Synced at ${lastSynced.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
    : 'Realtime connected'

  return (
    <TooltipProvider delayDuration={300}>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className={cn("flex items-center justify-center p-2 cursor-default", className)}>
            <div className="relative flex h-2 w-2 items-center justify-center">
              {status === 'syncing' && (
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
              )}
              <span className={cn("relative inline-flex rounded-full h-2 w-2 transition-all duration-300", indicatorColor)}></span>
            </div>
          </div>
        </TooltipTrigger>
        <TooltipContent side="right">
          <p className="text-xs">{tooltipText}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
