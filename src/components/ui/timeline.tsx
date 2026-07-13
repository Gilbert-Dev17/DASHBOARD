import * as React from "react"
import { cn } from "@/lib/utils"
import { Card, CardContent } from "@/components/ui/card"

const Timeline = React.forwardRef<HTMLOListElement, React.HTMLAttributes<HTMLOListElement>>(
  ({ className, ...props }, ref) => (
    <div className="flex-1 relative pb-8 pt-4">
      {/* Timeline Axis Line */}
      <div className="absolute top-0 bottom-0 left-20 w-px bg-border/50" />
      <ol ref={ref} className={cn("space-y-6 list-none m-0 p-0", className)} {...props} />
    </div>
  )
)
Timeline.displayName = "Timeline"

const TimelineItem = React.forwardRef<HTMLLIElement, React.HTMLAttributes<HTMLLIElement>>(
  ({ className, ...props }, ref) => (
    <li ref={ref} className={cn("relative flex items-start w-full", className)} {...props} />
  )
)
TimelineItem.displayName = "TimelineItem"

const TimelineTime = React.forwardRef<HTMLTimeElement, React.TimeHTMLAttributes<HTMLTimeElement>>(
  ({ className, ...props }, ref) => (
    <div className="absolute left-0 top-3 w-20 flex items-center justify-end">
      <time
        ref={ref}
        className={cn("text-[10px] font-mono tabular-nums text-muted-foreground mr-4 leading-none tracking-widest uppercase", className)}
        {...props}
      />
      <div className="absolute -right-1 h-2 w-2 rounded-md bg-accent ring-4 ring-background z-10 transition-colors duration-300" />
    </div>
  )
)
TimelineTime.displayName = "TimelineTime"

export interface TimelineContentProps extends React.HTMLAttributes<HTMLElement> {
  withCard?: boolean
}

const TimelineContent = React.forwardRef<HTMLElement, TimelineContentProps>(
  ({ className, withCard, children, ...props }, ref) => (
    <article ref={ref} className={cn("pl-28 w-full group transition-all duration-300", className)} {...props}>
      {withCard ? (
        <Card className="bg-transparent border-border/40 transition-colors rounded-md">
          <CardContent >
            {children}
          </CardContent>
        </Card>
      ) : (
        children
      )}
    </article>
  )
)
TimelineContent.displayName = "TimelineContent"

export { Timeline, TimelineItem, TimelineTime, TimelineContent }
