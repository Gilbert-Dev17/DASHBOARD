'use client'

import { useState, useMemo, TransitionStartFunction, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import {
  format, setMonth, setYear, addWeeks, subWeeks,
  startOfMonth, endOfMonth, startOfWeek, endOfWeek,
  eachDayOfInterval, isSameMonth, isSameDay, parseISO
} from 'date-fns'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { TaskWithSubtasks, Notes } from '@/types/dashboard'
import { formatTime } from '@/lib/formatTime'
import { cn } from '@/lib/utils'
import { getTodayInTimezone } from '@/utils/timezone'

import {
  Drawer,
  DrawerContent,
  DrawerClose,
} from '@/components/ui/drawer'
import { AgendaSection } from '@/components/Shared/AgendaSection'
import { NotesSection } from '@/components/Shared/NotesSection'
import { Spinner } from '@/components/ui/spinner'

/* ─── Constants ──────────────────────────────────────────────── */

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
]
const WEEK_DAYS = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT']
const WEEK_START = 0
const VISIBLE_TASKS = 2
const MIN_VIEW_H = 'min-h-[calc(100vh-14rem)]'

/* ─── Helpers ────────────────────────────────────────────────── */

/** Wraps router.push in startTransition when available */
function navigate(
  path: string,
  router: ReturnType<typeof useRouter>,
  startTransition?: TransitionStartFunction
) {
  if (startTransition) {
    startTransition(() => router.push(path))
  } else {
    router.push(path)
  }
}

/** Formats task time for display, returns empty string if no valid time */
function displayTime(time: string | null | undefined): string {
  if (!time) return ''
  return formatTime(time)
}

/* ─── Shared Sub-Components ──────────────────────────────────── */

/** Compact task pill used inside month cells */
function TaskPill({ task, muted = false }: { task: TaskWithSubtasks; muted?: boolean }) {
  return (
    <div className={cn(
      "text-xs font-mono px-1.5 py-0.5 truncate rounded-none shrink-0",
      task.is_done
        ? "bg-muted/50 text-muted-foreground line-through"
        : "bg-muted text-foreground/90",
      muted && "bg-muted/30 text-muted-foreground/70"
    )}>
      {task.task_name} {displayTime(task.time)}
    </div>
  )
}

/** Taller task card used inside week columns */
function TaskCard({ task, onClick }: { task: TaskWithSubtasks; onClick: () => void }) {
  return (
    <div
      onClick={onClick}
      className={cn(
        "border border-border p-2 flex flex-col gap-1 rounded-none cursor-pointer",
        "hover:border-foreground/30 transition-colors shrink-0",
        task.is_done ? "opacity-50" : "bg-card"
      )}
    >
      <span className={cn(
        "text-xs font-medium line-clamp-2",
        task.is_done ? "line-through text-muted-foreground" : "text-foreground"
      )}>
        {task.task_name}
      </span>
      {task.time && (
        <span className="text-[10px] font-mono text-muted-foreground uppercase">
          {displayTime(task.time)}
        </span>
      )}
    </div>
  )
}

/* ─── Main Component ─────────────────────────────────────────── */

interface FullCalendarProps {
  initialDate: Date
  monthTasks: Record<string, TaskWithSubtasks[]>
  datesWithTasks?: { date: string; count: number }[]
  startTransition?: TransitionStartFunction

  // New props for drawer functionality
  userId: string
  selectedDate?: string
  initialTasks?: TaskWithSubtasks[]
  note?: Notes | null
  autoOpenDrawer?: boolean
  isPending?: boolean
}

export function FullCalendar({
  initialDate,
  monthTasks,
  startTransition,
  userId,
  selectedDate,
  initialTasks,
  note,
  autoOpenDrawer,
  isPending
}: FullCalendarProps) {
  const router = useRouter()
  const [subView, setSubView] = useState<'week' | 'month'>('month')

  // Notice we don't need a local currentDate state anymore because
  // navigating updates the URL which re-renders the page with new initialDate.
  // But we keep it to avoid massive refactors, we just sync it.
  const [currentDate, setCurrentDate] = useState(initialDate)
  useEffect(() => setCurrentDate(initialDate), [initialDate])

  const todayDate = parseISO(getTodayInTimezone())
  const isOnToday = isSameDay(currentDate, todayDate)

  // Optimistic UI state for calendar view
  const [localMonthTasks, setLocalMonthTasks] = useState<Record<string, TaskWithSubtasks[]>>(monthTasks)

  useEffect(() => {
    setLocalMonthTasks(monthTasks)
  }, [monthTasks])

  useEffect(() => {
    const handleToggle = (e: Event) => {
      const { taskId, isDone } = (e as CustomEvent).detail
      setLocalMonthTasks(prev => {
        const next = { ...prev }
        let changed = false
        for (const date in next) {
          if (next[date].some(t => t.id === taskId)) {
            next[date] = next[date].map(t => t.id === taskId ? { ...t, is_done: isDone } : t)
            changed = true
          }
        }
        return changed ? next : prev
      })
    }

    const handleDelete = (e: Event) => {
      const { taskId } = (e as CustomEvent).detail
      setLocalMonthTasks(prev => {
        const next = { ...prev }
        let changed = false
        for (const date in next) {
          if (next[date].some(t => t.id === taskId)) {
            next[date] = next[date].filter(t => t.id !== taskId)
            changed = true
          }
        }
        return changed ? next : prev
      })
    }

    const handleUpdate = (e: Event) => {
      const { taskId, values } = (e as CustomEvent).detail
      setLocalMonthTasks(prev => {
        const next = { ...prev }
        let changed = false
        for (const date in next) {
          if (next[date].some(t => t.id === taskId)) {
            next[date] = next[date].map(t => {
              if (t.id !== taskId) return t
              return {
                ...t,
                task_name: values.task_name,
                time: values.time ? `${values.time}:00` : undefined,
                task_category: values.category ? { id: t.task_category?.id || null, name: values.category } : null,
              }
            })
            changed = true
          }
        }
        return changed ? next : prev
      })
    }

    const handleRestore = (e: Event) => {
      const { task } = (e as CustomEvent).detail
      const dateStr = task.created_for_date
      if (!dateStr) return
      setLocalMonthTasks(prev => {
        const tasksForDate = prev[dateStr] || []
        if (tasksForDate.some(t => t.id === task.id)) return prev
        return {
          ...prev,
          [dateStr]: [...tasksForDate, task]
        }
      })
    }

    window.addEventListener('optimistic-task-toggle', handleToggle)
    window.addEventListener('optimistic-task-delete', handleDelete)
    window.addEventListener('optimistic-task-update', handleUpdate)
    window.addEventListener('optimistic-task-restore', handleRestore)

    return () => {
      window.removeEventListener('optimistic-task-toggle', handleToggle)
      window.removeEventListener('optimistic-task-delete', handleDelete)
      window.removeEventListener('optimistic-task-update', handleUpdate)
      window.removeEventListener('optimistic-task-restore', handleRestore)
    }
  }, [])

  // Drawer state
  const [drawerDate, setDrawerDate] = useState<string | null>(autoOpenDrawer ? (selectedDate ?? null) : null)
  const [drawerTasks, setDrawerTasks] = useState<TaskWithSubtasks[]>(initialTasks ?? [])

  // Sync drawer state when navigating via URL with drawer=true
  useEffect(() => {
    if (autoOpenDrawer && selectedDate) {
      setDrawerDate(selectedDate)
      setDrawerTasks(initialTasks ?? [])

      // Clean up URL so refresh doesn't reopen drawer
      // We use replaceState to avoid triggering a Next.js navigation
      const url = new URL(window.location.href)
      url.searchParams.delete('drawer')
      window.history.replaceState({}, '', url.toString())
    }
  }, [autoOpenDrawer, selectedDate, initialTasks])

  // Year range: current year ± 5
  const yearOptions = useMemo(() => {
    const y = new Date().getFullYear()
    return Array.from({ length: 11 }, (_, i) => y - 5 + i)
  }, [])

  // Categorical focus summary
  const stats = useMemo(() => {
    const allTasks = Object.values(localMonthTasks).flat()
    const total = allTasks.length

    const counts: Record<string, number> = {}
    for (const t of allTasks) {
      const cat = t.task_category?.name?.toLowerCase() || 'uncategorized'
      counts[cat] = (counts[cat] || 0) + 1
    }

    let topCategory = 'tasks'
    let topCount = 0
    for (const [cat, count] of Object.entries(counts)) {
      if (count > topCount && cat !== 'uncategorized') {
        topCount = count
        topCategory = cat
      }
    }
    if (topCount === 0) { topCount = total; topCategory = 'tasks' }

    return { total, topCount, topCategory }
  }, [localMonthTasks])

  // Navigation handlers — these now trigger actual data fetches via URL
  const handlePrev = () => {
    const d = subView === 'week' ? subWeeks(currentDate, 1) : setMonth(currentDate, currentDate.getMonth() - 1)
    navigate(`/schedule?date=${format(d, 'yyyy-MM-dd')}`, router, startTransition)
  }
  const handleNext = () => {
    const d = subView === 'week' ? addWeeks(currentDate, 1) : setMonth(currentDate, currentDate.getMonth() + 1)
    navigate(`/schedule?date=${format(d, 'yyyy-MM-dd')}`, router, startTransition)
  }
  const handleMonthChange = (monthStr: string) => {
    const d = setMonth(currentDate, parseInt(monthStr))
    navigate(`/schedule?date=${format(d, 'yyyy-MM-dd')}`, router, startTransition)
  }
  const handleYearChange = (yearStr: string) => {
    const d = setYear(currentDate, parseInt(yearStr))
    navigate(`/schedule?date=${format(d, 'yyyy-MM-dd')}`, router, startTransition)
  }

  const handleToday = () => {
    navigate('/schedule', router, startTransition)
  }

  const handleDayClick = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd')

    // If clicking a date outside the current month (overflow),
    // navigate to it and auto-open drawer via URL param
    if (!isSameMonth(date, currentDate) && subView === 'month') {
      navigate(`/schedule?date=${dateStr}&drawer=true`, router, startTransition)
      return
    }

    // In-month date: open drawer locally (fast)
    setDrawerDate(dateStr)
    setDrawerTasks(localMonthTasks[dateStr] || [])
  }

  return (
    <div className="flex flex-col h-full w-full bg-background pb-8">
      {/* Header — single row */}
      <div className="flex items-center justify-between mb-6 shrink-0">
        {/* Left: Category Summary */}
        <div>
          <div className="text-4xl tracking-tight text-foreground font-pixel-circle leading-none">
            {stats.topCount}
            <span className="text-lg text-muted-foreground ml-2 font-sans capitalize">
              {stats.topCategory}
            </span>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Top category this month (out of {stats.total} total tasks)
          </p>
        </div>

        {/* Right: Nav + Toggle */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            {isPending && <Spinner className="w-4 h-4 text-primary animate-spin mr-2" />}
            {!isOnToday && (
              <Button variant="outline" size="sm" onClick={handleToday} className="rounded-none text-xs uppercase tracking-wider font-semibold border-border text-foreground hover:bg-muted h-8">
                Today
              </Button>
            )}

            <Button variant="ghost" size="icon" onClick={handlePrev} className="rounded-none hover:bg-muted text-muted-foreground hover:text-foreground h-8 w-8">
              <ChevronLeft className="h-4 w-4" />
            </Button>

            <Select value={String(currentDate.getMonth())} onValueChange={handleMonthChange}>
              <SelectTrigger className="w-[130px] rounded-none border-border bg-background text-sm font-medium h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="rounded-none border-border">
                {MONTHS.map((m, i) => (
                  <SelectItem key={m} value={String(i)} className="rounded-none text-sm">{m}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={String(currentDate.getFullYear())} onValueChange={handleYearChange}>
              <SelectTrigger className="w-[80px] rounded-none border-border bg-background text-sm font-medium h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="rounded-none border-border">
                {yearOptions.map(y => (
                  <SelectItem key={y} value={String(y)} className="rounded-none text-sm">{y}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button variant="ghost" size="icon" onClick={handleNext} className="rounded-none hover:bg-muted text-muted-foreground hover:text-foreground h-8 w-8">
              <ChevronRight className="h-4 w-4" />
            </Button>


          </div>

          <Tabs value={subView} onValueChange={v => setSubView(v as 'week' | 'month')} className="w-auto">
            <TabsList className="rounded-none bg-muted/50 p-0 border border-border">
              <TabsTrigger value="week" className="rounded-none text-xs uppercase tracking-wider data-[state=active]:bg-foreground data-[state=active]:text-background">Week</TabsTrigger>
              <TabsTrigger value="month" className="rounded-none text-xs uppercase tracking-wider data-[state=active]:bg-foreground data-[state=active]:text-background">Month</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      {/* Calendar Body */}
      <div className="flex-1 min-h-0">
        {subView === 'month'
          ? <MonthView currentDate={currentDate} monthTasks={localMonthTasks} onDayClick={handleDayClick} />
          : <WeekView currentDate={currentDate} monthTasks={localMonthTasks} onDayClick={handleDayClick} />
        }
      </div>

      <Drawer
        open={!!drawerDate}
        onOpenChange={(open) => !open && setDrawerDate(null)}
        swipeDirection="right"
      >
        <DrawerContent className="w-full sm:w-115 rounded-md bg-background border-border">
          <div className="flex flex-col flex-1 h-full min-h-0 bg-background">
            {/* Header matching NotesSection design */}
            <div className="shrink-0 flex items-end justify-between px-5 pt-5 pb-4 border-b border-border">
              <div className="flex flex-col gap-1">
                <span className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
                  Daily Overview
                </span>
                <span className="text-base font-medium tracking-tight text-foreground">
                  {drawerDate ? format(parseISO(drawerDate), 'EEEE, MMMM do') : ''}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <DrawerClose render={
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground hover:text-foreground"
                  >
                    Close
                  </Button>
                } />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-5 space-y-6 min-h-0">
              {/* Timeline View */}
              <div className="flex flex-col gap-2">
                <AgendaSection
                  initialTasks={drawerTasks}
                  selectedDateStr={drawerDate ?? ''}
                  showTitle={false}
                />
              </div>

              {/* Notes Section */}
              <div className="flex flex-col gap-2">
                  <NotesSection note={drawerDate === selectedDate ? (note ?? null) : undefined} dateStr={drawerDate ?? ''} userId={userId} />
              </div>
            </div>
          </div>
        </DrawerContent>
      </Drawer>
    </div>
  )
}

/* ─── Month View ─────────────────────────────────────────────── */

interface ViewProps {
  currentDate: Date
  monthTasks: Record<string, TaskWithSubtasks[]>
  onDayClick: (d: Date) => void
}

function MonthView({ currentDate, monthTasks, onDayClick }: ViewProps) {
  const monthStart = startOfMonth(currentDate)
  const days = eachDayOfInterval({
    start: startOfWeek(monthStart, { weekStartsOn: WEEK_START }),
    end: endOfWeek(endOfMonth(monthStart), { weekStartsOn: WEEK_START })
  })
  const today = new Date()

  return (
    <div className={cn("flex flex-col h-full border-t border-l border-border", MIN_VIEW_H)}>
      {/* Weekday headers — left aligned */}
      <div className="grid grid-cols-7 shrink-0 bg-muted/20">
        {WEEK_DAYS.map(day => (
          <div key={day} className="py-2 px-2 text-left border-r border-b border-border font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
            {day}
          </div>
        ))}
      </div>

      {/* Day cells */}
      <div className="grid grid-cols-7 flex-1 auto-rows-fr">
        {days.map(day => {
          const dateKey = format(day, 'yyyy-MM-dd')
          const tasks = monthTasks[dateKey] || []
          const isCurrentMonth = isSameMonth(day, monthStart)
          const isToday = isSameDay(day, today)

          return (
            <div
              key={day.toISOString()}
              onClick={() => onDayClick(day)}
              className={cn(
                "relative border-r border-b border-border p-2 cursor-pointer transition-colors flex flex-col gap-1 overflow-hidden",
                isCurrentMonth ? "hover:bg-muted/30" : "opacity-60"
              )}
            >
              {/* "x" watermark for outside-month days */}
              {!isCurrentMonth && (
                <span className="absolute inset-0 flex items-center justify-center font-pixel-grid text-5xl text-muted select-none pointer-events-none" aria-hidden>
                  x
                </span>
              )}

              <div className="relative z-10 flex justify-between items-center mb-1 shrink-0">
                <span className={cn(
                  "text-sm font-medium",
                  !isCurrentMonth ? "text-muted-foreground" : "text-foreground",
                  isToday && "bg-foreground text-background px-1.5 py-0.5 rounded-none"
                )}>
                  {format(day, 'd')}
                </span>
                {tasks.length > 0 && (
                  <span className="text-[10px] text-muted-foreground font-mono">{tasks.length}</span>
                )}
              </div>

              <div className="relative z-10 flex flex-col gap-1 overflow-hidden">
                {tasks.slice(0, VISIBLE_TASKS).map(task => (
                  <TaskPill key={task.id} task={task} muted={!isCurrentMonth} />
                ))}
                {tasks.length > VISIBLE_TASKS && (
                  <div className="text-[10px] text-muted-foreground mt-0.5 shrink-0">
                    +{tasks.length - VISIBLE_TASKS} more
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

/* ─── Week View ──────────────────────────────────────────────── */

function WeekView({ currentDate, monthTasks, onDayClick }: ViewProps) {
  const days = eachDayOfInterval({
    start: startOfWeek(currentDate, { weekStartsOn: WEEK_START }),
    end: endOfWeek(currentDate, { weekStartsOn: WEEK_START })
  })
  const today = new Date()

  return (
    <div className={cn("grid grid-cols-7 h-full border-t border-l border-border", MIN_VIEW_H)}>
      {days.map(day => {
        const tasks = monthTasks[format(day, 'yyyy-MM-dd')] || []
        const isToday = isSameDay(day, today)

        return (
          <div key={day.toISOString()} className="flex flex-col border-r border-b border-border">
            {/* Column header */}
            <div
              onClick={() => onDayClick(day)}
              className="p-3 flex flex-col items-center border-b border-border bg-muted/10 cursor-pointer hover:bg-muted/30 transition-colors shrink-0"
            >
              <span className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground mb-1">
                {format(day, 'EEE')}
              </span>
              <span className={cn(
                "text-lg font-bold w-8 h-8 flex items-center justify-center rounded-none",
                isToday ? "bg-foreground text-background" : "text-foreground"
              )}>
                {format(day, 'd')}
              </span>
            </div>

            {/* Task cards */}
            <div className="flex-1 p-2 flex flex-col gap-2 overflow-y-auto min-h-0 bg-background/50">
              {tasks.map(task => (
                <TaskCard key={task.id} task={task} onClick={() => onDayClick(day)} />
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}
