'use client'

import { useState, useTransition } from 'react'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { AgendaSection } from '@/components/Shared/AgendaSection'
import PageComponent from '@/components/Shared/PageComponent'
import { CustomCalendar } from '@/components/Shared/CustomCalendar'
import { TaskWithSubtasks, Notes } from '@/types/dashboard'
import { getTodayInTimezone } from '@/utils/timezone'
import { useRouter } from 'next/navigation'
import {NotesSection} from '@/components/Shared/NotesSection'

import { Spinner } from '@/components/ui/spinner'
import { MobileScheduleCalendar } from '@/components/Shared/MobileScheduleCalendar'

interface PageProps {
  agendaTitle: string
  initialTasks: TaskWithSubtasks[]
  note: Notes | null
  dateObj: Date
  datesWithTasks: { date: string; count: number }[]
  finalDate: string
}

export function PlannerPage({ agendaTitle, initialTasks, note, dateObj, datesWithTasks, finalDate }: PageProps) {
  // Notes state is now handled internally by NotesSection
  const router = useRouter()
  const [isPending, startTransition] = useTransition();
  const isToday = finalDate === getTodayInTimezone()

  return (
    <PageComponent>

      {/* MOBILE LAYOUT (< 1024px) */}
      <div className="lg:hidden flex flex-col relative">
        <MobileScheduleCalendar
          initialDate={dateObj}
          datesWithTasks={datesWithTasks}
          startTransition={startTransition}
        />

        <div className="flex flex-col mt-4 min-h-[125px]">
          <div className="flex justify-between items-center mb-4">
            <Label className="text-xl font-medium tracking-tight text-foreground" >
                {agendaTitle}
            </Label>
            <div className="flex items-center gap-2">
              {isPending && <Spinner className="w-4 h-4 text-primary animate-spin" /> }
              {!isToday && (
                <Button variant="link" size="sm" onClick={() => startTransition(() => router.push('/schedule'))} className="text-xs uppercase tracking-wider font-semibold text-foreground">
                  Today
                </Button>
              )}
            </div>
          </div>
          <AgendaSection initialTasks={initialTasks} selectedDateStr={finalDate} showTitle={false} />
        </div>

        <div className="mt-6 mb-4">
          <NotesSection note={note} dateStr={finalDate} />
        </div>
      </div>

      {/* DESKTOP LAYOUT (>= 1024px) */}
       <div className="hidden lg:grid grid-cols-12 gap-6 lg:h-[calc(100vh-7rem)]">

        <div className='lg:col-span-4 flex flex-col h-full space-y-4 min-h-0'>
          <div className="flex justify-between items-center shrink-0">
            <h2 className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
              Calendar
            </h2>
          </div>

          <CustomCalendar
            initialDate={dateObj}
            datesWithTasks={datesWithTasks}
            startTransition={startTransition}
          />

          <NotesSection note={note} dateStr={finalDate} />
        </div>

          <div className="lg:col-span-8 flex flex-col h-full overflow-hidden">
            <div className="flex justify-between items-center">
              <Label className="text-2xl font-medium tracking-tight text-foreground" >
                 {agendaTitle}
              </Label>

              <div className="flex items-center gap-2">
                {isPending && <Spinner className="w-4 h-4 text-primary animate-spin" /> }

                {!isToday && (
                  <Button
                    variant="link"
                    size="sm"
                    onClick={() => startTransition(() => router.push('/schedule'))}
                    className="text-xs uppercase tracking-wider font-semibold text-foreground"
                  >
                    Today
                  </Button>
                )}
              </div>
            </div>

            <AgendaSection initialTasks={initialTasks} selectedDateStr={finalDate} showTitle={false} />
          </div>
      </div>
    </PageComponent>
  )
}
