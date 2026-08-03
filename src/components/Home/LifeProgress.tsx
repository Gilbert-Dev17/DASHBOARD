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

  const progressData = useMemo(() => {
    const currentYear = now.getFullYear()
    const currentMonth = now.getMonth()
    const currentDate = now.getDate()

    // Calculate start and end dates
    const yearStart = new Date(currentYear, 0, 1)
    const yearEnd = new Date(currentYear + 1, 0, 1)

    const monthStart = new Date(currentYear, currentMonth, 1)
    const monthEnd = new Date(currentYear, currentMonth + 1, 1)

    const currentDay = now.getDay()
    const weekStart = new Date(currentYear, currentMonth, currentDate - currentDay)
    const weekEnd = new Date(weekStart.getTime() + 7 * 24 * 60 * 60 * 1000)

    const dayStart = new Date(currentYear, currentMonth, currentDate)
    const dayEnd = new Date(currentYear, currentMonth, currentDate + 1)

    // Helper to calculate percentage
    const getPercent = (start: Date, end: Date) =>
      ((now.getTime() - start.getTime()) / (end.getTime() - start.getTime())) * 100

    return [
      { label: 'Day', value: getPercent(dayStart, dayEnd) },
      { label: 'Week', value: getPercent(weekStart, weekEnd) },
      { label: 'Month', value: getPercent(monthStart, monthEnd) },
      { label: 'Year', value: getPercent(yearStart, yearEnd) },
    ]
  }, [now])

  return (
    <div className="w-full flex flex-col md:flex-row items-center justify-between gap-4 md:gap-8 text-[10px] sm:text-xs text-muted-foreground uppercase tracking-widest font-mono">
        {progressData.map(({ label, value }) => (
          <div key={label} className="flex items-center gap-3 w-full">
              <span className="w-12 text-right">{label}</span>
              <Progress value={value} className="h-0.5 flex-1 bg-border/40" />
              <span className="w-10">{value.toFixed(1)}%</span>
          </div>
        ))}
    </div>
  )
}
