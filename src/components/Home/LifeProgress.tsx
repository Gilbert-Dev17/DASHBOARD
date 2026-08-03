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

// * Week Progress
const weekProgress = useMemo(() => {
  const currentDay = now.getDay()
  const diff = now.getDate() - currentDay + (currentDay === 0 ? -6 : 1) // start on Monday
  const start = new Date(now.getFullYear(), now.getMonth(), diff)
  const end = new Date(start.getTime() + 7 * 24 * 60 * 60 * 1000)
  
  return (
    ((now.getTime() - start.getTime()) /
      (end.getTime() - start.getTime())) *
    100
  )
}, [now])

  return (
    <div className="w-full flex flex-col md:flex-row items-center justify-between gap-4 md:gap-8 text-[10px] sm:text-xs text-muted-foreground uppercase tracking-widest font-mono">
        <div className="flex items-center gap-3 w-full">
            <span className="w-12 text-right">Day</span>
            <Progress value={dayProgress} className="h-[2px] flex-1 bg-border/40" />
            <span className="w-10">{dayProgress.toFixed(0)}%</span>
        </div>
        <div className="flex items-center gap-3 w-full">
            <span className="w-12 text-right">Week</span>
            <Progress value={weekProgress} className="h-[2px] flex-1 bg-border/40" />
            <span className="w-10">{weekProgress.toFixed(0)}%</span>
        </div>
        <div className="flex items-center gap-3 w-full">
            <span className="w-12 text-right">Month</span>
            <Progress value={monthProgress} className="h-[2px] flex-1 bg-border/40" />
            <span className="w-10">{monthProgress.toFixed(0)}%</span>
        </div>
        <div className="flex items-center gap-3 w-full">
            <span className="w-12 text-right">Year</span>
            <Progress value={yearProgress} className="h-[2px] flex-1 bg-border/40" />
            <span className="w-10">{yearProgress.toFixed(0)}%</span>
        </div>
    </div>
  )
}
