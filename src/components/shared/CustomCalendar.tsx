'use client'

import React, {useState} from 'react'

import {format} from 'date-fns'
import {Card} from '@/components/ui/card'
import { Calendar } from '@/components/ui/calendar'

export const CustomCalendar = () => {
    const [date, setDate] = useState<Date | undefined>(new Date())

  return (
    <Card className="lg:col-span-8 p-6 bg-secondary">
      <Calendar
        mode="single"
        selected={date}
        onSelect={setDate}
        captionLayout='dropdown'
        className="w-full bg-secondary font-semibold uppercase tracking-wider"
        // 1. Format the weekdays to 3 letters (Sun, Mon, Tue)
        formatters={{
          formatWeekdayName: (date) => format(date, "E"),
        }}
        // 2. Updated classNames for v10
        classNames={{
          // Left-align the caption container
          month_caption: "flex h-8 w-full items-center justify-start",
          // Put the navigation arrows grouped on the right
          nav: "absolute right-0 top-0 flex items-center gap-1",
          // Target the v10 button class names directly
          button_previous: "static h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100",
          button_next: "static h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100",
          // Style the weekdays (v10 uses 'weekday' instead of 'head_cell')
        //   weekday: " font-semibold text-[0.75rem] uppercase tracking-wider w-9 text-center",
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
