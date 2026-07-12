'use client'

import { useRouter } from 'next/navigation'
import { format, parseISO } from 'date-fns'
import { Card } from '@/components/ui/card'
import { Calendar } from '@/components/ui/calendar'

interface CustomCalendarProps {
  initialDate?: Date;
  datesWithTasks?: { date: string; count: number }[];
}

export const CustomCalendar = ({ initialDate = new Date(), datesWithTasks = [] }: CustomCalendarProps) => {
  const router = useRouter()

  const handleSelect = (date: Date | undefined) => {
    if (!date) return
    const dateStr = format(date, 'yyyy-MM-dd')
    router.push(`/planner?date=${dateStr}`)
  }

  const task1Dates = datesWithTasks.filter(d => d.count > 0 && d.count < 10).map(d => parseISO(d.date))
  const task2Dates = datesWithTasks.filter(d => d.count >= 10 && d.count < 15).map(d => parseISO(d.date))
  const task3Dates = datesWithTasks.filter(d => d.count >= 15).map(d => parseISO(d.date))

  return (
    <Card className="lg:col-span-8 p-6 bg-secondary">
      <Calendar
        mode="single"
        selected={initialDate}
        onSelect={handleSelect}
        captionLayout='dropdown'
        className="w-full bg-transparent font-semibold uppercase tracking-wider gap-5"

        modifiers={{
          task1: task1Dates,
          task2: task2Dates,
          task3: task3Dates,
        }}
        modifiersClassNames={{
          task1: "relative after:content-['.'] after:absolute after:bottom-0.5 after:left-1/2 after:-translate-x-1/2 after:text-accent after:font-bold after:text-lg after:leading-none",
          task2: "relative after:content-['..'] after:absolute after:bottom-0.5 after:left-1/2 after:-translate-x-1/2 after:text-accent after:font-bold after:text-lg after:leading-none after:tracking-[0.1em]",
          task3: "relative after:content-['...'] after:absolute after:bottom-0.5 after:left-1/2 after:-translate-x-1/2 after:text-accent after:font-bold after:text-lg after:leading-none after:tracking-[0.1em]",
        }}

        formatters={{
          formatWeekdayName: (date) => format(date, "E"),
        }}
        classNames={{
          month_caption: "flex h-8 w-full items-center justify-start",
          nav: "absolute right-0 top-0 flex items-center gap-1",

          button_previous: "static h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100",
          button_next: "static h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100",
        }}
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
          )
        }}
      />
    </Card>
  )
}
