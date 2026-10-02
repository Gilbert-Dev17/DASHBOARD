'use client'

import { useState, useEffect, useRef, TransitionStartFunction } from 'react'
import { CustomCalendar } from './CustomCalendar'
import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface MobileScheduleCalendarProps {
  initialDate?: Date;
  datesWithTasks?: { date: string; count: number }[];
  startTransition?: TransitionStartFunction;
}

export function MobileScheduleCalendar({ initialDate, datesWithTasks, startTransition }: MobileScheduleCalendarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const sentinelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        // Only auto-collapse when scrolling down past the sentinel.
        // We do NOT auto-expand when scrolling up (handled manually by the nub).
        if (!entry.isIntersecting) {
          setIsCollapsed(true)
        }
      },
      { threshold: 0, rootMargin: '-100px 0px 0px 0px' } // Offset for the fixed header
    )

    if (sentinelRef.current) {
      observer.observe(sentinelRef.current)
    }

    return () => observer.disconnect()
  }, [])

  return (
    <>
      <div ref={sentinelRef} className="h-px w-full absolute top-0 left-0" aria-hidden="true" />
      
      <div 
        className={cn(
          "sticky top-0 z-20 bg-background pt-2 pb-4 transition-all duration-500 ease-in-out calendar-collapse-wrapper",
          isCollapsed ? "is-collapsed shadow-sm" : ""
        )}
      >
        <style dangerouslySetInnerHTML={{ __html: `
          /* Base transitions for smooth animation */
          .calendar-collapse-wrapper .rdp-week {
            transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
            overflow: hidden;
            max-height: 120px; /* Safe upper bound for a week row */
            opacity: 1;
            margin-top: 0.5rem; /* Matches tailwind mt-2 */
          }
          
          .calendar-collapse-wrapper .rdp-month_caption,
          .calendar-collapse-wrapper .rdp-nav {
            transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
            max-height: 40px;
            opacity: 1;
            overflow: hidden;
          }

          /* Collapsed state styles */
          .calendar-collapse-wrapper.is-collapsed .rdp-week:not(:has([data-selected-single=true], [data-selected=true])) {
            max-height: 0 !important;
            opacity: 0 !important;
            margin-top: 0 !important;
            padding-top: 0 !important;
            padding-bottom: 0 !important;
            border: 0 !important;
          }
          
          .calendar-collapse-wrapper.is-collapsed .rdp-month_caption,
          .calendar-collapse-wrapper.is-collapsed .rdp-nav {
            max-height: 0 !important;
            opacity: 0 !important;
            margin: 0 !important;
            pointer-events: none;
          }
        `}} />
        
        <div className="max-w-md mx-auto w-full">
          <CustomCalendar
            initialDate={initialDate}
            datesWithTasks={datesWithTasks}
            startTransition={startTransition}
            hideNavigation={isCollapsed}
          />
        </div>
        
        {/* A tiny affordance bar to indicate tap to expand/collapse */}
        <div 
          className="w-12 h-1.5 bg-muted rounded-full mx-auto mt-3 cursor-pointer hover:bg-muted-foreground/50 transition-colors" 
          onClick={() => setIsCollapsed(!isCollapsed)}
          aria-label={isCollapsed ? "Expand calendar" : "Collapse calendar"}
        />
      </div>
    </>
  )
}
