import React from 'react'
import { Skeleton } from '../ui/skeleton'

export const WeatherCardSkeleton = () => {
  return (
    <div className="relative z-10 w-full max-w-5xl">
      {/* Background glow mimic */}
      <div className="absolute -right-20 -top-20 w-64 h-64 rounded-full mix-blend-overlay opacity-10 blur-[80px] transition-colors duration-500 bg-accent pointer-events-none" />

      {/* Prose Paragraph Skeletons */}
      <div className="space-y-4 md:space-y-5">
        <Skeleton className="h-7 md:h-9 w-full max-w-4xl" />
        <Skeleton className="h-7 md:h-9 w-[90%] max-w-3xl" />
        <Skeleton className="h-7 md:h-9 w-[75%] max-w-2xl" />
      </div>

      {/* Chips Skeletons */}
      <div className="flex flex-wrap items-center gap-3 md:gap-4 mt-8">
        <Skeleton className="h-9 w-32 rounded-full" />
        <Skeleton className="h-9 w-44 rounded-full" />
        <Skeleton className="h-9 w-36 rounded-full" />
      </div>
    </div>
  )
}