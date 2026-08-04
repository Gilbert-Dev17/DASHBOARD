import PageComponent from '@/components/Shared/PageComponent'
import { Skeleton } from '@/components/ui/skeleton'

export default function AccountLoading() {
  return (
    <PageComponent>
      <div className="mx-auto w-full pt-6">
        {/* HEADER */}
        <header className="flex flex-col gap-6 mb-12">
          <div className="flex justify-between items-center w-full">
            <Skeleton className="h-8 w-20 rounded-md" />
            <Skeleton className="h-8 w-8 rounded-md" />
          </div>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="flex items-center gap-4">
              <Skeleton className="h-16 w-16 rounded-2xl" />
              <div className="flex flex-col gap-2">
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-3 w-20" />
              </div>
            </div>

            <div className="flex flex-col md:text-right gap-2">
              <Skeleton className="h-3 w-24 md:ml-auto" />
              <Skeleton className="h-10 w-40 md:ml-auto" />
            </div>
          </div>
        </header>

        {/* TRANSACTIONS SECTION */}
        <section className="bg-card/30 border border-dashed border-border/50 rounded-3xl p-6 md:p-8">
          <Skeleton className="h-4 w-40 mb-8" />

          <div className="flex flex-col gap-8">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex gap-4">
                <Skeleton className="h-4 w-12 shrink-0 mt-1" />
                <div className="flex flex-col gap-2 flex-1 relative">
                  <div className="absolute left-[-1.3rem] top-1.5 h-3 w-3 rounded-full bg-border" />

                  <div className="flex justify-between">
                    <div className="flex flex-col gap-2">
                      <Skeleton className="h-5 w-48" />
                      <Skeleton className="h-3 w-20" />
                    </div>
                    <Skeleton className="h-5 w-16 shrink-0" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </PageComponent>
  )
}
