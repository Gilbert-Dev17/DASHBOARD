import PageComponent from '@/components/Shared/PageComponent'
import { Skeleton } from '@/components/ui/skeleton'

export default function HomeLoading() {
  return (
    <PageComponent>
      {/* Greeting Header Skeleton (Left-aligned) */}
      <div className="flex flex-col justify-center items-start flex-1 w-full max-w-5xl mx-auto space-y-6">
        {/* Large Day Text Skeleton */}
        <Skeleton className="h-24 md:h-32 w-48 md:w-64 rounded-md mb-4" />
        
        {/* Paragraph Skeleton */}
        <div className="flex flex-col gap-3 w-full max-w-3xl">
          <Skeleton className="h-6 md:h-8 w-full rounded-md" />
          <Skeleton className="h-6 md:h-8 w-[90%] rounded-md" />
          <Skeleton className="h-6 md:h-8 w-[60%] rounded-md" />
        </div>

        {/* Badge Chips Skeleton */}
        <div className="flex gap-3 mt-6">
          <Skeleton className="h-6 w-32 rounded-full" />
          <Skeleton className="h-6 w-28 rounded-full" />
        </div>
      </div>

      {/* Life Progress Skeleton (Bottom) */}
      <div className="w-full pb-2 mt-auto">
        <div aria-hidden="true" className="w-full flex flex-col md:flex-row items-center justify-between gap-4 md:gap-8">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-center gap-3 w-full">
              <Skeleton className="h-3 w-12" />
              <Skeleton className="h-[2px] flex-1" />
              <Skeleton className="h-3 w-10" />
            </div>
          ))}
        </div>
      </div>
    </PageComponent>
  )
}
