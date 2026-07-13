'use client'

import { useTheme } from 'next-themes'
import { useState, useEffect } from 'react'
import { Sun, Moon, LogOut, Mail } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

interface ProfileSettingsProps {
  email?: string
}

export function ProfileSettings({ email }: ProfileSettingsProps) {
  const { resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => setMounted(true), [])

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) {
      toast.error('Failed to sign out')
    } else {
      toast.success('Signed out successfully')
      router.push('/login')
      router.refresh()
    }
  }

  if (!mounted) return null

  return (
    <>
      {/* Account */}
      <section aria-labelledby="account-heading">
        <h2 id="account-heading" className="text-xs font-semibold uppercase tracking-[0.2em] mb-6 lg:mb-8 transition-colors duration-500">
          Account
        </h2>

        <div className="space-y-4">
          {/* Email */}
          <Card variant="dashed">
            <CardContent className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Mail size={16} className="text-accent shrink-0" />
                <div>
                  <span className="text-sm font-medium">Email</span>
                  <p className="text-xs text-muted-foreground font-mono">{email}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Google OAuth — Active */}
          <Card variant="dashed">
            <CardContent className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <svg viewBox="0 0 24 24" width="16" height="16" className="shrink-0">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                <div>
                  <span className="text-sm font-medium">Google Sign-in</span>
                  <p className="text-xs text-muted-foreground">Signed in with Google OAuth</p>
                </div>
              </div>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-accent">Active</span>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Preferences */}
      <section aria-labelledby="preferences-heading">
        <h2 id="preferences-heading" className="text-xs font-semibold uppercase tracking-[0.2em] mb-6 lg:mb-8 transition-colors duration-500">
          Preferences
        </h2>

        <div className="space-y-4">
          {/* Theme */}
          <Card variant="dashed">
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

          {/* Currency */}
          <Card variant="dashed">
            <CardContent className="flex items-center justify-between">
              <div>
                <span className="text-sm font-medium">Currency</span>
                <p className="text-xs text-muted-foreground">Philippine Peso (₱)</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Sign Out */}
      <section className='flex justify-end'>
        <Button
          variant="link"
          className="text-destructive hover:text-destructive"
          onClick={handleSignOut}
        >
          <LogOut size={16} />
          Sign out
        </Button>
      </section>
    </>
  )
}
