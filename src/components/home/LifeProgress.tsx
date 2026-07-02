'use client'

import { useEffect, useMemo, useState } from 'react'
import { Progress } from '@/components/ui/progress'

export const LifeProgress = () => {

const [now, setNow] = useState(new Date())

useEffect(() => {
  const interval = setInterval(() => {
    setNow(new Date())
  }, 1000)

  return () => clearInterval(interval)
}, [])

// * Year Progress
const yearProgress = useMemo(() => {
  const start = new Date(now.getFullYear(), 0, 1)
  const end = new Date(now.getFullYear() + 1, 0, 1)

  return (
    ((now.getTime() - start.getTime()) /
      (end.getTime() - start.getTime())) *
    100
  )
}, [now])
// * Month Progress
const monthProgress = useMemo(() => {
  const start = new Date(now.getFullYear(), now.getMonth(), 1)
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 1)

  return (
    ((now.getTime() - start.getTime()) /
      (end.getTime() - start.getTime())) *
    100
  )
}, [now])
// * Day Progress
const dayProgress = useMemo(() => {
  const start = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate()
  )

  const end = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate() + 1
  )

  return (
    ((now.getTime() - start.getTime()) /
      (end.getTime() - start.getTime())) *
    100
  )
}, [now])

  return (
    <section aria-labelledby="progress-heading">
        <h2
            id="progress-heading"
            className="text-xs font-semibold uppercase tracking-[0.2em] mb-6 lg:mb-8 transition-colors duration-500"
        >
            Life Progress
        </h2>

        <div className="space-y-6 lg:space-y-8">
            <div className="space-y-2">
            <div className="flex items-center justify-between">
                <span>Year</span>
                <span className="text-sm text-muted-foreground">
                {yearProgress.toFixed(1)}%
                </span>
            </div>
            <Progress value={yearProgress} aria-label="Year Progress" />
            </div>

            <div className="space-y-2">
            <div className="flex items-center justify-between">
                <span>Month</span>
                <span className="text-sm text-muted-foreground">
                {monthProgress.toFixed(1)}%
                </span>
            </div>
            <Progress value={monthProgress} aria-label="Month Progress" />
            </div>

            <div className="space-y-2">
            <div className="flex items-center justify-between">
                <span>Day</span>
                <span className="text-sm text-muted-foreground">
                {dayProgress.toFixed(1)}%
                </span>
            </div>
            <Progress value={dayProgress} aria-label="Day Progress" />
            </div>
        </div>
        </section>
  )
}
