'use client'

import React, {useState} from 'react'

import { CheckCircle2, Circle } from 'lucide-react'

import {Card, CardContent} from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { ScrollArea } from '@/components/ui/scroll-area'

import PageComponent from '@/components/shared/PageComponent'
import { CustomCalendar } from '@/components/shared/CustomCalendar'

const page = () => {
  const [date, setDate] = useState<Date | undefined>(new Date())

    const [tasks, setTasks] = useState([
      { id: 1, text: "Wake up - 7:30 am", done: true, category: "Routine", subtasks: [{id: 41, text: "Prepare slides", done: true}, {id: 42, text: "Review Figma components", done: false}] },
      { id: 2, text: "Do Duolingo", done: true, category: "Routine", subtasks: [{id: 41, text: "Prepare slides", done: true}, {id: 42, text: "Review Figma components", done: false}] },
      { id: 3, text: "Workout: Chest + Back", done: true, category: "Health", subtasks: [{id: 41, text: "Prepare slides", done: true}, {id: 42, text: "Review Figma components", done: false}] },
      { id: 4, text: "Design Crit with Team", done: false, category: "Work", time: "10:00" , subtasks: [{id: 41, text: "Prepare slides", done: true}, {id: 42, text: "Review Figma components", done: false}]},
      { id: 5, text: "Haircut with Vincent", done: false, category: "Personal", time: "13:00", subtasks: [{id: 41, text: "Prepare slides", done: true}, {id: 42, text: "Review Figma components", done: false}] },
      { id: 6, text: "Cleanup code & finish Auth", done: false, category: "Code: Re.Focus", subtasks: [{id: 41, text: "Prepare slides", done: true}, {id: 42, text: "Review Figma components", done: false}] }
    ]);

  return (
    <PageComponent>
       <div className="grid grid-cols-12 gap-10 h-[calc(100vh-7rem)]">

        <CustomCalendar/>

        <div className="lg:col-span-4 flex flex-col h-full overflow-hidden">

             <div className="flex justify-between items-center mt-2 mb-2">
               <Label className="text-3xl font-light tracking-tight" >
                  Today's Schedule
               </Label>
             </div>

             <ScrollArea className="flex-1 min-h-0">
                <div className="relative pl-14 pb-8 pt-4">
                  {/* Timeline Axis */}
                  <div className="absolute top-0 bottom-0 left-20 w-px bg-border" />

                  {['07:00', '09:00', '11:00', '13:00', '15:00', '17:00'].map(
                    (hour, idx) => {
                      const nextHours = [
                        '09:00',
                        '11:00',
                        '13:00',
                        '15:00',
                        '17:00',
                        '23:59',
                      ];

                      const tasksInBlock = tasks.filter(
                        (t) =>
                          !t.done &&
                          t.time &&
                          t.time >= hour &&
                          t.time < nextHours[idx]
                      );

                      return (
                        <div
                          key={hour}
                          className="relative mb-12 min-h-12"
                        >
                          <span className="absolute -left-14 top-0 text-xs font-semibold tabular-nums text-muted-foreground">
                            {hour}
                          </span>

                          <div className="absolute left-5 top-1.5 h-2 w-2 rounded-full bg-primary" />

                          <div className="pl-8 space-y-3">
                            {tasksInBlock.length === 0 ? (
                              <div className="py-1 text-xs italic text-muted-foreground">
                                Open block
                              </div>
                            ) : (
                              tasksInBlock.map((task) => (
                               <Card
                                    key={task.id}
                                    className="w-fit min-w-60 max-w-85 transition-all hover:-translate-y-1"
                                  >
                                  <CardContent className="p-4 pt-0 pb-0">
                                    <h4 className="font-medium text-sm tracking-wide">
                                      {task.text}
                                    </h4>

                                    <p className=" text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                                      {task.category}
                                    </p>

                                    {task.subtasks?.length > 0 && (
                                      <div className="mt-3 space-y-2 border-l pl-3">
                                        {task.subtasks.map((st) => (
                                          <div
                                            key={`${task.id}-${st.id}`}
                                            className="flex items-center gap-2"
                                          >
                                            {st.done ? (
                                              <CheckCircle2 size={14} />
                                            ) : (
                                              <Circle size={14} />
                                            )}

                                            <span
                                              className={`text-xs ${
                                                st.done
                                                  ? 'line-through opacity-50'
                                                  : ''
                                              }`}
                                            >
                                              {st.text}
                                            </span>
                                          </div>
                                        ))}
                                      </div>
                                    )}
                                  </CardContent>
                                </Card>
                              ))
                            )}
                          </div>
                        </div>
                      );
                    }
                  )}
                </div>
              </ScrollArea>
          </div>

      </div>
    </PageComponent>
  )
}

export default page