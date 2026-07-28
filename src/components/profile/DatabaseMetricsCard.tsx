'use client'

import { Database, Server } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { TableCounts, DatabaseMetrics } from '@/types/database'

interface DatabaseMetricsCardProps extends DatabaseMetrics {
  tableCounts: TableCounts
}

const DB_LIMIT_MB = 500

export function DatabaseMetricsCard({ size_mb, size_pretty, tableCounts }: DatabaseMetricsCardProps) {
  const usagePercent = Math.min((size_mb / DB_LIMIT_MB) * 100, 100)

  let indicatorColor = 'bg-emerald-500' // < 50%
  if (usagePercent >= 80) {
    indicatorColor = 'bg-rose-500' // > 80%
  } else if (usagePercent >= 50) {
    indicatorColor = 'bg-amber-500' // 50% - 80%
  }

  const totalRows =
    tableCounts.tasks +
    tableCounts.subtasks +
    tableCounts.daily_notes +
    tableCounts.transactions +
    tableCounts.wallets

  const tableLabels: { label: string; count: number }[] = [
    { label: 'Tasks', count: tableCounts.tasks + tableCounts.subtasks },
    { label: 'Notes', count: tableCounts.daily_notes },
    { label: 'Transactions', count: tableCounts.transactions },
    { label: 'Wallets', count: tableCounts.wallets },
  ]

  return (
    <div className="rounded-xl border border-border/60 bg-card p-6 space-y-5">
      {/* Top Tags */}
      <div className="flex items-center justify-between">

        <div>
          <div className="flex items-center gap-2 mb-1">
            <Database size={14} className="text-accent shrink-0" />
            <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              Database Storage
            </h3>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            {usagePercent < 50
              ? "You're well within your storage limits."
              : usagePercent < 80
              ? 'Storage usage is growing. Consider archiving old data.'
              : 'Storage usage is critically high. Review and clean up data soon.'}
          </p>
        </div>

        <Server size={14} className="text-muted-foreground shrink-0" />
      </div>

      {/* Big Number + Delta */}
      <div className="flex items-baseline gap-3">
        <span className="text-4xl font-bold tracking-tight tabular-nums">
          {usagePercent.toFixed(1)}%
        </span>
        <div className="flex items-center gap-1.5 rounded-md border border-border/60 px-2 py-0.5">
          <span className="text-[10px] font-semibold text-muted-foreground">
            ↑ {size_pretty}
          </span>
        </div>
        <span className="text-xs text-muted-foreground">of {DB_LIMIT_MB}MB used</span>
      </div>

      {/* Progress Bar */}
      <div className="pt-2 pb-1">
        <Progress value={usagePercent} indicatorColor={indicatorColor} />
      </div>

      {/* Footer */}
      <p className="text-[10px] text-muted-foreground font-mono">
        {totalRows.toLocaleString()} total records across {tableLabels.length} tables
      </p>

      {/* <div className="flex items-center gap-2 flex-wrap">
          {tableLabels.map(({ label, count }) => (
            <Badge
              key={label}
              variant="secondary"
              className="text-[10px] font-semibold uppercase tracking-wider rounded-md px-2 py-0.5"
            >
              {label} · {count}
            </Badge>
          ))}
        </div> */}
    </div>
  )
}
