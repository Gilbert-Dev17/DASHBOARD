'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import { format, parseISO } from 'date-fns'
import { Card } from '@/components/ui/card'
import { Calendar } from '@/components/ui/calendar'

interface CustomCalendarProps {
  initialDate?: Date;
  datesWithTasks?: string[]; // Array of 'YYYY-MM-DD' strings
}

export const CustomCalendar = ({ initialDate = new Date(), datesWithTasks = [] }: CustomCalendarProps) => {
  const router = useRouter()

  const handleSelect = (date: Date | undefined) => {
    if (!date) return
    const dateStr = format(date, 'yyyy-MM-dd')
    // Push the selected date to the URL to trigger a server-side fetch
    router.push(`/planner?date=${dateStr}`)
  }

  // Convert string array to Date array for the calendar modifier
  const activeDates = datesWithTasks.map(dateStr => parseISO(dateStr))

  return (
    <Card className="lg:col-span-8 p-6 bg-secondary">
      <Calendar
        mode="single"
        selected={initialDate}
        onSelect={handleSelect}
        captionLayout='dropdown'
        className="w-full bg-transparent font-semibold uppercase tracking-wider"

        // Add custom modifiers to highlight days with tasks
        modifiers={{
          hasTask: activeDates
        }}
        modifiersClassNames={{
          hasTask: "relative after:content-[''] after:absolute after:bottom-1 after:left-1/2 after:-translate-x-1/2 after:w-1 after:h-1 after:bg-accent after:rounded-full"
        }}

        // 1. Format the weekdays to 3 letters (Sun, Mon, Tue)
        formatters={{
          formatWeekdayName: (date) => format(date, "E"),
        }}
        // 2. Updated classNames for v10
        classNames={{
          // Left-align the caption container
          month_caption: "flex h-8 w-full items-center justify-start",
          nav: "absolute right-0 top-0 flex items-center gap-1",

          button_previous: "static h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100",
          button_next: "static h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100",
        }}
        // 3. Updated components for v10
        components={{
          MonthCaption: ({ calendarMonth }) => (
            <div className="text-xl flex gap-2 items-baseline px-1">
              <span className="font-bold text-foreground">
                {format(calendarMonth.date, "MMMM")}
              </span>
              <span className="text-muted-foreground font-normal text-lg">
                {format(calendarMonth.date, "yyyy")}
              </span>
            </div>
          ),
        }}
      />
    </Card>
  )
}
