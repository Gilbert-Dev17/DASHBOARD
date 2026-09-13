import PageComponent from '@/components/Shared/PageComponent'
import { Skeleton } from '@/components/ui/skeleton'

export default function HomeLoading() {
  return (
    <PageComponent>
      <div className="flex flex-col justify-center flex-1 w-full mx-auto">
        
        {/* Day of Week Header Skeleton */}
        <div className="flex justify-between items-center mb-8 lg:mb-12">
          <Skeleton className="h-16 md:h-24 lg:h-[120px] w-64 md:w-96 lg:w-[500px] rounded-none bg-muted/50" />
        </div>
        
        {/* Greeting Paragraph Skeleton */}
        <div className="flex flex-col gap-3 w-full max-w-5xl">
          <Skeleton className="h-8 md:h-10 lg:h-12 w-full rounded-none bg-muted/50" />
          <Skeleton className="h-8 md:h-10 lg:h-12 w-[90%] rounded-none bg-muted/50" />
          <Skeleton className="h-8 md:h-10 lg:h-12 w-[70%] rounded-none bg-muted/50" />
        </div>

        {/* Badge Chips Skeleton */}
        <div className="flex flex-wrap items-center gap-3 md:gap-4 mt-6">
          <Skeleton className="h-6 w-32 rounded-sm bg-muted/50" />
          <Skeleton className="h-6 w-40 rounded-sm bg-muted/50" />
          <Skeleton className="h-6 w-28 rounded-sm bg-muted/50" />
        </div>
        
      </div>

      {/* Life Progress Skeleton (Bottom) */}
      <div className="w-full pb-2 mt-auto">
        <div aria-hidden="true" className="w-full flex flex-col md:flex-row items-center justify-between gap-4 md:gap-8">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-center gap-3 w-full">
              <Skeleton className="h-3 w-12 rounded-none bg-muted/50" />
              <Skeleton className="h-[2px] flex-1 rounded-none bg-muted/50" />
              <Skeleton className="h-3 w-10 rounded-none bg-muted/50" />
            </div>
          ))}
        </div>
      </div>
    </PageComponent>
  )
}
