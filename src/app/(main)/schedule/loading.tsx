import PageComponent from '@/components/Shared/PageComponent'
import { Skeleton } from '@/components/ui/skeleton'

export default function ScheduleLoading() {
  return (
    <PageComponent>
      {/* Header */}
      <div className="mb-4">
        <div className="flex flex-col gap-2">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-4 w-64" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:h-[calc(100vh-7rem)]">
        
        {/* Left Column (Calendar & Notes) */}
        <div className="lg:col-span-4 flex flex-col h-full space-y-4 min-h-0">
          <div className="flex justify-between items-center shrink-0">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-8 w-24 rounded-md" />
          </div>

          {/* Calendar Skeleton */}
          <div className="flex flex-col gap-4">
            {/* Calendar Header */}
            <div className="flex justify-between items-center pt-2">
              <Skeleton className="h-6 w-32" />
              <div className="flex gap-2">
                <Skeleton className="h-8 w-8 rounded-md" />
                <Skeleton className="h-8 w-8 rounded-md" />
              </div>
            </div>
            {/* Days of week */}
            <div className="grid grid-cols-7 gap-2">
              {[...Array(7)].map((_, i) => (
                <Skeleton key={`dow-${i}`} className="h-4 w-full" />
              ))}
            </div>
            {/* Dates Grid */}
            <div className="grid grid-cols-7 gap-y-4 gap-x-2">
              {[...Array(35)].map((_, i) => (
                <Skeleton key={`date-${i}`} className="h-10 w-full rounded-md" />
              ))}
            </div>
          </div>

          {/* Notes Unexpanded Skeleton */}
          <div className="rounded-md border border-border bg-card mt-4">
            <div className="flex items-center justify-between px-4 pt-4 pb-3 border-b border-border">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-3 w-12" />
            </div>
            <div className="px-4 py-3">
              <Skeleton className="h-8 w-full" />
            </div>
          </div>
        </div>

        {/* Right Column (Agenda) */}
        <div className="lg:col-span-8 flex flex-col h-full overflow-hidden">
          <div className="flex justify-between items-center mb-6 lg:mb-8">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-8 w-16" />
          </div>

          {/* Agenda Timeline Skeleton */}
          <div className="flex-1 overflow-hidden">
            <div className="flex flex-col gap-8">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex gap-4">
                  <Skeleton className="h-4 w-12 shrink-0 mt-1" />
                  <div className="flex flex-col gap-2 flex-1 relative">
                    {/* Timeline dot/line approximation */}
                    <div className="absolute -left-[1.3rem] top-1.5 h-3 w-3 rounded-full bg-border" />
                    
                    <div className="flex justify-between">
                      <div className="flex flex-col gap-2">
                        <Skeleton className="h-5 w-48" />
                        <Skeleton className="h-3 w-20" />
                      </div>
                      <Skeleton className="h-5 w-5 rounded-full shrink-0" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        
      </div>
    </PageComponent>
  )
}
