import PageComponent from '@/components/Shared/PageComponent'
import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent } from '@/components/ui/card'

export default function ProfileLoading() {
  return (
    <PageComponent>
      {/* HEADER */}
      <header className="mb-16 lg:mb-20">
        <div className="flex items-center gap-6 mb-8 lg:mb-12">
          <Skeleton className="w-20 h-20 lg:w-24 lg:h-24 rounded-full shrink-0" />
          <Skeleton className="h-14 lg:h-20 w-64 md:w-96 rounded-md" />
        </div>
      </header>

      {/* MAIN GRID */}
      <div className="space-y-8">
        
        {/* Account & Preferences (ProfileSettings) */}
        <div className="space-y-8">
          {/* Account */}
          <section>
            <Skeleton className="h-4 w-20 mb-6 lg:mb-8" />
            <Card>
              <CardContent className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-4 w-4 rounded-full shrink-0" />
                  <div className="flex flex-col gap-2">
                    <Skeleton className="h-4 w-40" />
                    <Skeleton className="h-3 w-32" />
                  </div>
                </div>
                <Skeleton className="h-3 w-12 hidden sm:block" />
              </CardContent>
            </Card>
          </section>

          {/* Preferences */}
          <section>
            <Skeleton className="h-4 w-24 mb-6 lg:mb-8" />
            <div className="flex flex-col sm:flex-row justify-between gap-4">
              <Card className="w-full">
                <CardContent className="flex items-center justify-between">
                  <div className="flex flex-col gap-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-3 w-32" />
                  </div>
                  <Skeleton className="h-8 w-24 rounded-md" />
                </CardContent>
              </Card>

              <Card className="w-full">
                <CardContent className="flex items-center justify-between">
                  <div className="flex flex-col gap-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-40" />
                  </div>
                  <Skeleton className="h-8 w-20 rounded-md" />
                </CardContent>
              </Card>
            </div>
          </section>
        </div>

        {/* System */}
        <section>
          <Skeleton className="h-4 w-16 mb-6 lg:mb-8" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="bg-card/30">
              <CardContent>
                <div className="flex justify-between items-center mb-6">
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-4 w-4 rounded-md" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                </div>
                <div className="flex items-end justify-between">
                  <div className="flex flex-col gap-2">
                    <Skeleton className="h-6 w-32" />
                    <Skeleton className="h-3 w-48" />
                  </div>
                  <Skeleton className="h-8 w-8 rounded-md" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card/30">
              <CardContent>
                <div className="flex justify-between items-center mb-6">
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-4 w-4 rounded-md" />
                    <Skeleton className="h-4 w-28" />
                  </div>
                </div>
                <div className="flex flex-col gap-4">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <Skeleton className="h-4 w-4 rounded-md" />
                        <Skeleton className="h-4 w-20" />
                      </div>
                      <Skeleton className="h-4 w-8" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Sign Out */}
        <section className='flex justify-end pt-4'>
          <Skeleton className="h-8 w-24 rounded-md" />
        </section>

      </div>
    </PageComponent>
  )
}
