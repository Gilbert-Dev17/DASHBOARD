'use client'

import { useTheme } from 'next-themes'
import { useState, useEffect } from 'react'
import { Sun, Moon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

export function ThemeToggleButton() {
  const { resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 0);
    return () => clearTimeout(timer);
  }, [])

  if (!mounted) return null

  return (
    <Card className='w-full'>
      <CardContent className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative h-4 w-4 shrink-0 overflow-hidden text-foreground">
            <Sun className="absolute inset-0 h-4 w-4 rotate-0 scale-100 transition-all duration-500 ease-in-out dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute inset-0 h-4 w-4 rotate-90 scale-0 transition-all duration-500 ease-in-out dark:rotate-0 dark:scale-100" />
          </div>
          <div>
            <span className="text-sm font-medium">Appearance</span>
            <p className="text-xs text-muted-foreground">{resolvedTheme === 'dark' ? 'Dark' : 'Light'} mode</p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="text-xs uppercase tracking-wider font-semibold"
          onClick={() => {
            const newTheme = resolvedTheme === 'dark' ? 'light' : 'dark'
            
            // Use native View Transition API if supported for a smooth page fade!
            if (!document.startViewTransition) {
              setTheme(newTheme)
              return
            }
            
            document.startViewTransition(() => {
              setTheme(newTheme)
            })
          }}
        >
          Toggle
        </Button>
      </CardContent>
    </Card>
  )
}
