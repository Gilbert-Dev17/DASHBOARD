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
          {resolvedTheme === 'dark' ? <Moon size={16} className="text-accent shrink-0" /> : <Sun size={16} className="text-accent shrink-0" />}
          <div>
            <span className="text-sm font-medium">Appearance</span>
            <p className="text-xs text-muted-foreground">{resolvedTheme === 'dark' ? 'Dark' : 'Light'} mode</p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="text-xs uppercase tracking-wider font-semibold"
          onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
        >
          Toggle
        </Button>
      </CardContent>
    </Card>
  )
}
