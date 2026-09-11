import PageComponent from '@/components/Shared/PageComponent'
import { Skeleton } from '@/components/ui/skeleton'

export default function Loading() {
  return (
    <PageComponent>
      <div className="flex flex-col gap-4">
        {/* Header Skeleton */}
        <div className="flex items-center justify-between pb-4">
          <Skeleton className="h-8 w-48" />
        </div>
        
        {/* Form Skeleton */}
        <div className="flex flex-col gap-4 max-w-2xl mx-auto w-full mt-4">
          {/* Amount Field */}
          <div className="space-y-2">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-14 w-full" />
          </div>
          
          {/* Account Field */}
          <div className="space-y-2">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-10 w-full" />
          </div>

          {/* Category Field */}
          <div className="space-y-2">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-10 w-full" />
          </div>
          
          {/* Date Field */}
          <div className="space-y-2">
            <Skeleton className="h-4 w-12" />
            <Skeleton className="h-10 w-full" />
          </div>

          {/* Note Field */}
          <div className="space-y-2">
            <Skeleton className="h-4 w-12" />
            <Skeleton className="h-10 w-full" />
          </div>

          {/* Submit Button */}
          <Skeleton className="h-11 w-full mt-2" />
        </div>
      </div>
    </PageComponent>
  )
}
