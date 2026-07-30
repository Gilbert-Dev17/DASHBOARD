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
import { HeaderTitle } from '@/components/Shared/HeaderTitle'
import {NotesSection} from '@/components/Shared/NotesSection'

import { Spinner } from '@/components/ui/spinner'

interface PageProps {
  agendaTitle: string
  initialTasks: TaskWithSubtasks[]
  note: Notes | null
  dateObj: Date
  datesWithTasks: { date: string; count: number }[]
  finalDate: string
}

export function PlannerPage({ agendaTitle, initialTasks, note, dateObj, datesWithTasks, finalDate }: PageProps) {
  const [showNotes, setShowNotes] = useState(false)
  const router = useRouter()
  const [isPending, startTransition] = useTransition();
  const isToday = finalDate === getTodayInTimezone()

  return (
    <PageComponent>
      <div className='mb-4'>
        <HeaderTitle
          title='Schedule'
          desc='Organize your tasks and capture daily reflections.'/>
      </div>

       <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:h-[calc(100vh-7rem)]">

        <div className='lg:col-span-4 flex flex-col h-full space-y-4 min-h-0'>
          <div className="flex justify-between items-center shrink-0">
            <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">
              {showNotes ? 'Daily Notes' : 'Calendar'}
            </h2>

            <Button variant="ghost" size="sm" onClick={() => setShowNotes(!showNotes)} className="text-xs">
              {showNotes ? 'Show Calendar' : ''}
            </Button>
          </div>

          {!showNotes && (
            <CustomCalendar
              initialDate={dateObj}
              datesWithTasks={datesWithTasks}
              startTransition={startTransition}
            />
          )}

          <NotesSection note={note} dateStr={finalDate} isExpanded={showNotes} onExpand={() => setShowNotes(true)} />
        </div>


          <div className="lg:col-span-8 flex flex-col h-full overflow-hidden">
            <div className="flex justify-between items-center">
              <Label className="text-2xl font-medium tracking-tight text-accent" >
                 {agendaTitle}
              </Label>

              <div className="flex items-center gap-2">
                {isPending && <Spinner className="w-4 h-4 text-primary animate-spin" /> }

                {!isToday && (
                  <Button
                    variant="link"
                    size="sm"
                    onClick={() => startTransition(() => router.push('/schedule'))}
                    className="text-xs uppercase tracking-wider font-semibold text-accent"
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
