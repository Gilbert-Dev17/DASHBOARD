'use client'

import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { AgendaSection } from '@/components/shared/AgendaSection'
import PageComponent from '@/components/shared/PageComponent'
import { CustomCalendar } from '@/components/shared/CustomCalendar'
import { TaskWithSubtasks } from '@/types/dashboard'
import { getTodayInTimezone } from '@/utils/timezone'
import { useRouter } from 'next/navigation'

interface PageProps {
  agendaTitle: string
  initialTasks: TaskWithSubtasks[]
  dateObj: Date
  datesWithTasks: { date: string; count: number }[]
  finalDate: string
}

export function PlannerPage({ agendaTitle, initialTasks, dateObj, datesWithTasks, finalDate }: PageProps) {
  const router = useRouter()
  const isToday = finalDate === getTodayInTimezone()

  return (
    <PageComponent>
       <div className="grid grid-cols-12 gap-10 h-[calc(100vh-7rem)]">

        <CustomCalendar
          initialDate={dateObj}
          datesWithTasks={datesWithTasks}
        />

        <div className="lg:col-span-4 flex flex-col h-full overflow-hidden">
             <div className="flex justify-between items-center mt-2 mb-2">
               <Label className="text-3xl font-light tracking-tight" >
                  {agendaTitle}
               </Label>
               {!isToday && (
                 <Button
                   variant="link"
                   size="sm"
                   onClick={() => router.push('/planner')}
                   className="text-xs uppercase tracking-wider font-semibold text-accent"
                 >
                   Today
                 </Button>
               )}
             </div>

            <AgendaSection initialTasks={initialTasks} selectedDateStr={finalDate} showTitle={false} />
          </div>
      </div>
    </PageComponent>
  )
}
