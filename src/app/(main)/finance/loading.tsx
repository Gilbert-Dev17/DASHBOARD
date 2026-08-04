import PageComponent from '@/components/Shared/PageComponent'
import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent, CardHeader } from '@/components/ui/card'

export default function FinanceLoading() {
  return (
    <PageComponent>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
        <div className="flex flex-col gap-2">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-4 w-64" />
        </div>
        <Skeleton className="h-10 w-[120px] rounded-md" />
      </div>

      {/* Summary Expense (Net Worth Card) */}
      <div className="flex flex-col gap-6">
        <Card className="bg-card/30">
          <CardHeader className="pb-2">
            <Skeleton className="h-4 w-24" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-12 w-48 mb-4" />
            <Skeleton className="h-[200px] w-full mt-6 rounded-lg" />
          </CardContent>
        </Card>

        {/* Mobile Income/Expense */}
        <div className="block lg:hidden">
          <div className="flex gap-4">
            <Skeleton className="h-24 flex-1 rounded-xl" />
            <Skeleton className="h-24 flex-1 rounded-xl" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6">
        {/* Left Column */}
        <div className="lg:col-span-8 flex flex-col gap-6 min-w-0">
          {/* Wallet Grid */}
          <Card className="bg-card/30">
            <CardHeader className="flex flex-row items-center justify-between">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-8 w-24 rounded-md" />
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
              <Skeleton className="h-[120px] w-full rounded-xl" />
              <Skeleton className="h-[120px] w-full rounded-xl" />
              <Skeleton className="h-[120px] w-full rounded-xl" />
            </CardContent>
          </Card>

          {/* Category Section */}
          <Card className="bg-card/30 gap-0">
            <CardHeader className="flex justify-between items-center">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-8 w-24 rounded-md" />
            </CardHeader>
            <CardContent className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              <div className="flex justify-center items-center w-full">
                <Skeleton className="w-[250px] h-[250px] rounded-full" />
              </div>
              <div className="flex flex-col gap-10">
                <div className="flex flex-col gap-2">
                  <Skeleton className="h-3 w-16" />
                  <Skeleton className="h-10 w-32" />
                </div>
                <div className="flex flex-col gap-4">
                  <Skeleton className="h-3 w-24" />
                  <div className="flex flex-wrap gap-2">
                    <Skeleton className="h-6 w-20 rounded-full" />
                    <Skeleton className="h-6 w-24 rounded-full" />
                    <Skeleton className="h-6 w-16 rounded-full" />
                    <Skeleton className="h-6 w-28 rounded-full" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          {/* Desktop Income/Expense */}
          <div className="hidden lg:flex gap-4 flex-col xl:flex-row">
            <Skeleton className="h-24 flex-1 rounded-xl" />
            <Skeleton className="h-24 flex-1 rounded-xl" />
          </div>

          {/* Recent Logs Section */}
          <div className="flex flex-col flex-1">
            <div className="flex flex-row justify-between items-center pb-4 mb-2">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-4 w-16" />
            </div>
            <div className="flex flex-col gap-6 pt-2 pl-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex gap-4">
                  <div className="flex flex-col gap-2 flex-1">
                    <div className="flex justify-between">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-4 w-16" />
                    </div>
                    <Skeleton className="h-3 w-20" />
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
