import React from 'react'
import { CloudSun, Droplets, Wind, Sun, Moon, MapPin, RefreshCw } from 'lucide-react'
import { Separator } from '../ui/separator'
import { Skeleton } from '../ui/skeleton'


export const WeatherCardSkeleton = () => {

    const skeletonStats = Array.from({ length: 4 }, (_, index) => index)

  return (
    <>
      <div className="flex items-center gap-6 relative z-10">
        <div className="absolute -right-195 -top-10 w-40 h-40 rounded-full mix-blend-overlay opacity-15 blur-3xl transition-colors duration-500 bg-accent" />
        <div className="w-16 h-16 rounded-full flex items-center justify-center shrink-0 transition-colors duration-500 bg-secondary">
          <CloudSun size={32} aria-hidden="true" className="text-accent" />
        </div>
        <div>
          <div className="text-5xl font-light tracking-tighter mb-1">
            <Skeleton className="h-11 w-30" />
          </div>
          <div className='flex' >
            <Skeleton className="h-4 w-20" />
            <span className="mx-2" aria-hidden="true">•</span>
            <Skeleton className="h-4 w-15" />
            <span className="mx-2" aria-hidden="true">•</span>
            <Skeleton className="h-4 w-20" />
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-6 relative z-10">
        {skeletonStats.map((item, index) => (
          <React.Fragment key={item}>
            <div className="flex flex-col gap-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-6 w-20" />
            </div>
            {index < skeletonStats.length - 2 && <Separator orientation="vertical" />}
          </React.Fragment>
        ))}
      </div>
    </>
  )
}

export function Stat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-2 mb-1">
        {icon}
        <span className="text-[10px] uppercase tracking-wider font-semibold">{label}</span>
      </div>
      <span className="font-medium tabular-nums">{value}</span>
    </div>
  )
}