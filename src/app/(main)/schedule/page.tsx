import { getTodayInTimezone } from '@/utils/timezone'
import { startOfMonth, endOfMonth, parseISO, format, startOfWeek, endOfWeek } from 'date-fns'

import { PlannerPage } from "./client"
import { getTasksByDate, getMonthTasksSummary, getDailyNotes, getMonthTasksGrouped } from "./action"
import { getUser } from "@/lib/auth/get-user";
import { redirect } from "next/navigation";

interface pageProps{
  searchParams: Promise<{date? : string, drawer?: string}>
}

export default async function page(props: pageProps) {
  const searchParams = await props.searchParams;

  const user = await getUser()

  if (!user || !user.id) {
    redirect('/login');
  }

  const selectedDateStr = await searchParams.date || getTodayInTimezone()
  const autoOpenDrawer = (await searchParams).drawer === 'true'

  const isValidDate = /^\d{4}-\d{2}-\d{2}$/.test(selectedDateStr)
  const finalDateStr = isValidDate ? selectedDateStr : getTodayInTimezone()
  const dateObj = parseISO(finalDateStr)

  const monthStart = startOfMonth(dateObj)
  const monthEnd = endOfMonth(dateObj)
  const startStr = format(startOfWeek(monthStart, { weekStartsOn: 0 }), 'yyyy-MM-dd')
  const endStr = format(endOfWeek(monthEnd, { weekStartsOn: 0 }), 'yyyy-MM-dd')

  const [selectedTasks, datesWithTasks, NotesToday, monthTasks] = await Promise.all([
    getTasksByDate(user.id, finalDateStr),
    getMonthTasksSummary(user.id, startStr, endStr),
    getDailyNotes(user.id, finalDateStr),
    getMonthTasksGrouped(user.id, startStr, endStr)
  ])

  const isToday = finalDateStr === getTodayInTimezone()
  const agendaTitle = isToday ? "Today's Schedule" : `${format(dateObj, 'MMMM d')} Schedule`

  return (
    <PlannerPage
      userId={user.id}
      initialTasks={selectedTasks}
      agendaTitle={agendaTitle}
      dateObj={dateObj}
      note={NotesToday}
      datesWithTasks={datesWithTasks}
      finalDate={finalDateStr}
      monthTasks={monthTasks}
      autoOpenDrawer={autoOpenDrawer}
    />
  )
}
