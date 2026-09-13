import PageComponent from '@/components/Shared/PageComponent'
import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent, CardHeader } from '@/components/ui/card'

export default function FinanceLoading() {
  return (
    <PageComponent>
      <div className="flex flex-col gap-4">
        {/* Summary Expense (Net Worth) */}
        <div className="flex flex-col gap-2">
          <Skeleton className="h-4 w-24 rounded-none bg-muted/50" />
          <Skeleton className="h-12 w-48 mb-4 rounded-none bg-muted/50" />
          <Skeleton className="h-[200px] w-full mt-2 rounded-none bg-muted/50" />
        </div>

        {/* Mobile Income/Expense */}
        <div className="block lg:hidden mt-4">
          <div className="flex gap-4">
            <Skeleton className="h-16 flex-1 rounded-none bg-muted/50" />
            <Skeleton className="h-16 flex-1 rounded-none bg-muted/50" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 mt-10">
        {/* Left Column */}
        <div className="lg:col-span-8 flex flex-col gap-10 min-w-0">
          
          {/* Wallet Grid */}
          <div>
            <div className="flex flex-row items-center justify-between mb-4">
              <Skeleton className="h-3 w-20 rounded-none bg-muted/50" />
              <Skeleton className="h-6 w-24 rounded-none bg-muted/50" />
            </div>
            <div className="flex flex-col gap-2">
              <Skeleton className="h-[80px] w-full rounded-none bg-muted/50" />
              <Skeleton className="h-[80px] w-full rounded-none bg-muted/50" />
              <Skeleton className="h-[80px] w-full rounded-none bg-muted/50" />
            </div>
          </div>

          {/* Category Section */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <Skeleton className="h-3 w-24 rounded-none bg-muted/50" />
              <Skeleton className="h-6 w-24 rounded-none bg-muted/50" />
            </div>
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              <div className="flex justify-center items-center w-full">
                <Skeleton className="w-[200px] h-[200px] rounded-full bg-muted/50" />
              </div>
              <div className="flex flex-col gap-8 justify-center">
                <div className="flex flex-col gap-2">
                  <Skeleton className="h-3 w-16 rounded-none bg-muted/50" />
                  <Skeleton className="h-8 w-32 rounded-none bg-muted/50" />
                </div>
                <div className="flex flex-col gap-3">
                  <Skeleton className="h-3 w-24 rounded-none bg-muted/50" />
                  <div className="flex flex-wrap gap-2">
                    <Skeleton className="h-5 w-20 rounded-none bg-muted/50" />
                    <Skeleton className="h-5 w-24 rounded-none bg-muted/50" />
                    <Skeleton className="h-5 w-16 rounded-none bg-muted/50" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="lg:col-span-4 flex flex-col gap-10">
          
          {/* Desktop Income/Expense */}
          <div className="hidden lg:flex gap-4 flex-col xl:flex-row">
            <Skeleton className="h-16 flex-1 rounded-none bg-muted/50" />
            <Skeleton className="h-16 flex-1 rounded-none bg-muted/50" />
          </div>

          {/* Recent Logs Section */}
          <div className="flex flex-col flex-1">
            <div className="flex flex-row justify-between items-center border-b border-border pb-2 mb-4">
              <Skeleton className="h-3 w-28 rounded-none bg-muted/50" />
              <Skeleton className="h-3 w-16 rounded-none bg-muted/50" />
            </div>
            <div className="flex flex-col gap-5 pt-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex gap-4">
                  <div className="flex flex-col gap-2 flex-1">
                    <div className="flex justify-between">
                      <Skeleton className="h-4 w-32 rounded-none bg-muted/50" />
                      <Skeleton className="h-4 w-16 rounded-none bg-muted/50" />
                    </div>
                    <Skeleton className="h-3 w-20 rounded-none bg-muted/50" />
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
