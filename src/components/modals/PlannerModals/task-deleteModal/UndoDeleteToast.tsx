'use client'

import { useEffect, useState } from 'react'
import { Progress } from '@/components/ui/progress'

const UNDO_DURATION = 5000
const TICK_INTERVAL = 50

export function UndoCountdown() {
  const [progress, setProgress] = useState(100)

  useEffect(() => {
    const start = Date.now()
    const interval = setInterval(() => {
      const elapsed = Date.now() - start
      const remaining = Math.max(0, 100 - (elapsed / UNDO_DURATION) * 100)
      setProgress(remaining)
      if (remaining <= 0) clearInterval(interval)
    }, TICK_INTERVAL)

    return () => clearInterval(interval)
  }, [])

  return <Progress value={progress} className="h-1 mt-2" />
}
