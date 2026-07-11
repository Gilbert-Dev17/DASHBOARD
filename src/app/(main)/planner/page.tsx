import { getTodayInTimezone } from '@/hooks/getTimezone'
import { startOfMonth, endOfMonth, parseISO, format } from 'date-fns'

import { PlannerPage } from "@/components/planner/plannerPage"
import { getTasksByDate, getMonthTasksSummary } from "./action"
import { getUser } from "@/lib/auth/get-user";
import { redirect } from "next/navigation";

interface pageProps{
  searchParams: Promise<{date? : string}>
}

export default async function page(props: pageProps) {
  const searchParams = await props.searchParams;

  const user = await getUser()

  if (!user) {
    redirect('/logIn')
  }

  const selectedDateStr = await searchParams.date || getTodayInTimezone()

  const isValidDate = /^\d{4}-\d{2}-\d{2}$/.test(selectedDateStr)
  const finalDateStr = isValidDate ? selectedDateStr : getTodayInTimezone()
  const dateObj = parseISO(finalDateStr)

  const selectedTasks = await getTasksByDate(user.id, finalDateStr)

  const startStr = format(startOfMonth(dateObj), 'yyyy-MM-dd')
  const endStr = format(endOfMonth(dateObj), 'yyyy-MM-dd')
  const datesWithTasks = await getMonthTasksSummary(user.id, startStr, endStr)

  const isToday = finalDateStr === getTodayInTimezone()
  const agendaTitle = isToday ? "Today's Schedule" : `${format(dateObj, 'MMMM d')} Schedule`

  return (
    <PlannerPage
      initialTasks={selectedTasks}
      agendaTitle={agendaTitle}
      dateObj={dateObj}
      datesWithTasks={datesWithTasks}
      finalDate={finalDateStr}
    />
  )
}
