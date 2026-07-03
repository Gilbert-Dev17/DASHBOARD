'use client'

import React, {useMemo} from 'react'
import {format} from 'date-fns'
import { Task } from './schemas'
import { generateDailyBrief } from '@/utils/daily-brief'

interface userGreeting {
    firstName: string;
    tasks?: Task[];
}

// TODO: connect everything in the dashboard page, the schemas should only have one source of truth at all time so then we call only creates copies if needed
// * and have the proper setup for the dashboard page where we prop drill. goodluckk we can do this and get a freaking job rorrrrrrr

const parseBoldText = (text: string) => {
  const parts = text.split(/(\*\*.*?\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <span key={i} className="font-bold">{part.slice(2, -2)}</span>;
    }
    return <React.Fragment key={i}>{part}</React.Fragment>;
  });
};

export const GreetingHeader = ({firstName, tasks = []}: userGreeting) => {
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

    const brief = useMemo(() => generateDailyBrief(tasks), [tasks]);

  return (
    <>
        <div className="flex justify-between items-start mb-8 lg:mb-12">
          <h1 className="text-6xl md:text-8xl lg:text-[9rem] font-bold tracking-tighter leading-none flex items-end">
            {dayOfWeek}
            <span className="w-3 h-3 md:w-4 md:h-4 lg:w-6 lg:h-6 rounded-full ml-3 md:ml-5 mb-2 md:mb-4 lg:mb-6 transition-colors duration-500 bg-accent" aria-hidden="true" />
          </h1>
        </div>

        <p className="text-2xl md:text-3xl lg:text-4xl leading-snug font-light max-w-4xl tracking-tight">
          {greeting}, <span className="font-bold">{firstName}</span>. {parseBoldText(brief.message)}
        </p>
    </>
  )
}
