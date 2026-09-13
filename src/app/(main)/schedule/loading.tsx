import PageComponent from '@/components/Shared/PageComponent'
import { Skeleton } from '@/components/ui/skeleton'

export default function ScheduleLoading() {
  return (
    <PageComponent>
      <div className="flex flex-col h-full w-full bg-background pb-8 min-h-[calc(100vh-7rem)]">
        {/* Header — single row */}
        <div className="flex items-center justify-between mb-6 shrink-0">
          {/* Left: Category Summary Skeleton */}
          <div>
            <Skeleton className="h-10 w-48 rounded-none bg-muted/50" />
            <Skeleton className="h-4 w-72 mt-2 rounded-none bg-muted/50" />
          </div>

          {/* Right: Nav + Toggle Skeleton */}
          <div className="flex items-center gap-2">
            <Skeleton className="h-8 w-16 rounded-none bg-muted/50" />
            <Skeleton className="h-8 w-8 rounded-none bg-muted/50" />
            <Skeleton className="h-8 w-[130px] rounded-none bg-muted/50" />
            <Skeleton className="h-8 w-[80px] rounded-none bg-muted/50" />
            <Skeleton className="h-8 w-8 rounded-none bg-muted/50" />
            <Skeleton className="h-8 w-32 ml-2 rounded-none bg-muted/50" />
          </div>
        </div>

        {/* Calendar Grid Skeleton */}
        <div className="flex flex-col flex-1 border border-border bg-background shadow-sm overflow-hidden">
          {/* Day Headers */}
          <div className="grid grid-cols-7 border-b border-border bg-muted/20">
            {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map(day => (
              <div key={day} className="py-3 text-[11px] font-mono tracking-wider font-semibold text-muted-foreground text-left pl-3 border-r border-border last:border-r-0">
                {day}
              </div>
            ))}
          </div>

          {/* Grid Cells (Month View) */}
          <div className="grid grid-cols-7 grid-rows-5 flex-1 bg-border gap-px">
            {[...Array(35)].map((_, i) => (
              <div key={i} className="bg-background p-2 flex flex-col gap-2">
                <Skeleton className="h-4 w-6 rounded-none bg-muted/50 ml-auto" />
                <Skeleton className="h-3 w-3/4 rounded-none bg-muted/50" />
                <Skeleton className="h-3 w-1/2 rounded-none bg-muted/50" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </PageComponent>
  )
}
