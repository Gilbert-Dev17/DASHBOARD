'use client'

import { useMemo, useState, useEffect, Fragment } from 'react'
import { format } from 'date-fns'
import { TaskWithSubtasks } from '@/types/dashboard'
import { generateDailyBrief } from '@/utils/daily-brief'

interface userGreeting {
    firstName?: string;
    tasks?: TaskWithSubtasks[];
}

const parseBoldText = (text: string) => {
  const parts = text.split(/(\*\*.*?\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <span key={i} className="font-semibold text-accent">{part.slice(2, -2)}</span>;
    }
    return <Fragment key={i}>{part}</Fragment>;
  });
};

const getGreeting = (time: Date) => {
  const hour = time.getHours()
  const earlyMorning = [ 'Rise and Shine', 'Top of the Morning', 'Good Early Morning', 'Coffee time?', ]
  const morning = [ 'Good Morning', 'Morning', 'Ready for today?', 'Let\'s go!', ]
  const midday = [ 'Good Midday', 'Halfway through!', 'Hope your day is going well', 'Keep it up!', ]
  const afternoon = [ 'Good Afternoon', 'Afternoon', 'Afternoon grind', 'Stretch break?', ]
  const lateAfternoon = [ 'Evening approaching', 'Home stretch', 'Almost there', 'Getting close!', ]
  const evening = [ 'Good Evening', 'Welcome Back', 'Hope you had a productive day', 'Wind down?', ]
  const night = [ 'Good Night', 'Burning the midnight oil?', 'Working late?', 'Night Owl', ]

  const pick = (messages: string[]) => messages[time.getDate() % messages.length]

  if (hour >= 5 && hour < 8) return pick(earlyMorning)
  if (hour >= 8 && hour < 12) return pick(morning)
  if (hour >= 12 && hour < 14) return pick(midday)
  if (hour >= 14 && hour < 17) return pick(afternoon)
  if (hour >= 17 && hour < 19) return pick(lateAfternoon)
  if (hour >= 19 && hour < 21) return pick(evening)
  return pick(night)
}

export const GreetingHeader = ({firstName, tasks = []}: userGreeting) => {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
      // Update the time every minute so the greeting naturally shifts (e.g. Morning -> Afternoon)
      const intervalId = setInterval(() => {
          setCurrentTime(new Date());
      }, 60000);
      return () => clearInterval(intervalId);
  }, []);

  const dayOfWeek = useMemo(() => {
      return format(currentTime, 'E');
  }, [currentTime]);

  const greeting = useMemo(() => getGreeting(currentTime), [currentTime])
  const brief = useMemo(() => generateDailyBrief(tasks), [tasks]);

  return (
    <>
        <div className="flex justify-between items-center mb-8 lg:mb-12">
          <h1 className="text-6xl md:text-8xl lg:text-[9rem] font-bold tracking-tighter leading-none flex items-end">
            {dayOfWeek}
            <span className="w-3 h-3 md:w-4 md:h-4 lg:w-6 lg:h-6 rounded-full ml-3 md:ml-5 mb-2 md:mb-4 lg:mb-6 transition-colors duration-500 bg-accent" aria-hidden="true" />
          </h1>

          <div className='flex flex-col items-end justify-end '>
            <h2 className='text-muted-foreground/80 text-xl md:text-2xl lg:text-3xl font-semibold tracking-tight uppercase'>
              {format(currentTime, 'MMMM d')}
            </h2>
            <h3 className='font-mono text-muted-foreground/40 text-sm md:text-base tracking-[0.3em] mt-1'>
              {format(currentTime, 'yyyy')}
            </h3>
          </div>
        </div>

        <p className="text-2xl md:text-3xl lg:text-4xl leading-snug font-light max-w-5xl tracking-tight text-pretty whitespace-pre-wrap">
          {greeting}, <span className="font-bold">{firstName}</span>. {parseBoldText(brief.message)}
        </p>
    </>
  )
}
