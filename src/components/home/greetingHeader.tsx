'use client'

import React, {useMemo} from 'react'
import {format} from 'date-fns'
import {
  Calendar, CheckSquare, Activity,
} from 'lucide-react'

import { Task } from './schemas'

interface userGreeting {
    firstName: string;

}

export const GreetingHeader = ({firstName}: userGreeting) => {
    const today = new Date();

    const dayOfWeek = useMemo(() => {
        return format(today, 'E');
      }, [today]);

    const greeting = useMemo(() => {
        const hour = new Date().getHours()

        const morning = [ 'Good Morning', 'Morning', 'Rise and Shine', 'Top of the Morning', 'Ready for today?', ]

        const afternoon = [ 'Good Afternoon', 'Afternoon', 'Hope your day is going well', 'Hello there',]

        const evening = [ 'Good Evening', 'Evening', 'Welcome Back', 'Hope you had a productive day',]

        const night = [ 'Good Night', 'Burning the midnight oil?', 'Working late?', 'Night Owl',]

        const pick = (messages: string[]) =>
            messages[new Date().getDate() % messages.length]

        if (hour >= 5 && hour < 12) return pick(morning)
        if (hour >= 12 && hour < 17) return pick(afternoon)
        if (hour >= 17 && hour < 21) return pick(evening)
        return pick(night)
        }, [])

  return (
    <>
        <div className="flex justify-between items-start mb-8 lg:mb-12">
          <h1 className="text-6xl md:text-8xl lg:text-[9rem] font-bold tracking-tighter leading-none flex items-end">
            {dayOfWeek}
            <span className="w-3 h-3 md:w-4 md:h-4 lg:w-6 lg:h-6 rounded-full ml-3 md:ml-5 mb-2 md:mb-4 lg:mb-6 transition-colors duration-500 bg-accent" aria-hidden="true" />
          </h1>
        </div>

        <p className="text-2xl md:text-3xl lg:text-4xl leading-snug font-light max-w-4xl tracking-tight">
          {greeting}, <span className="font-bold">{firstName}</span>.
          {/* You have <span className="inline-flex items-center gap-1 mx-1"><Calendar size={24} aria-hidden="true" /> {user.meetingsCount} meetings</span>,
          <span className="inline-flex items-center gap-1 mx-1"><CheckSquare size={24} aria-hidden="true" /> {user.tasksCount} tasks</span> and
          <span className="inline-flex items-center gap-1 mx-1"><Activity size={24} aria-hidden="true" /> {user.habitsCount} habit</span> today. */}
        </p>
    </>
  )
}
