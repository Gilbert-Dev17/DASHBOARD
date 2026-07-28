'use client'

import React, { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { ThemeToggle } from './ThemeToggle'
import { toast } from 'sonner'

import { updateDefaultCurrency } from '@/app/(main)/profile/action'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { UserSummary } from '@/types/dashboard'
import { AVAILABLE_CURRENCIES } from '@/lib/constants/currencies'

interface ProfileSettingsProps {
  user: UserSummary
}

export function ProfileSettings({ user }: ProfileSettingsProps) {
  const [currency, setCurrency] = useState(user.activeCurrency || 'PHP')
  const [isUpdatingCurrency, setIsUpdatingCurrency] = useState(false)

  const handleCurrencyChange = async (val: string) => {
    setCurrency(val)
    setIsUpdatingCurrency(true)

    if (user.id) {
      const { success, error } = await updateDefaultCurrency(user.id, val)
      if (success) {
        toast.success(`Default currency updated to ${val}`)
      } else {
        toast.error(error || 'Failed to update currency')
      }
    }
    setIsUpdatingCurrency(false)
  }

  return (
    <React.Fragment>
      {/* Account */}
      <section aria-labelledby="account-heading">
        <h2 id="account-heading" className="text-xs font-semibold uppercase tracking-[0.2em] mb-6 lg:mb-8 transition-colors duration-500">
          Account
        </h2>

          {/* Google OAuth — Active */}
          <Card>
            <CardContent className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <svg viewBox="0 0 24 24" width="16" height="16" className="shrink-0">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                <div>
                  <span className="text-sm font-medium">Signed in with Google OAuth</span>
                  <p className="text-xs text-muted-foreground font-mono">{user.email}</p>
                </div>
              </div>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-accent">Active</span>
            </CardContent>
          </Card>
      </section>

      {/* Preferences */}
      <section aria-labelledby="preferences-heading">
        <h2 id="preferences-heading" className="text-xs font-semibold uppercase tracking-[0.2em] mb-6 lg:mb-8 transition-colors duration-500">
          Preferences
        </h2>

        <div className="flex flex-row justify-between gap-4">
          {/* Theme */}
          <ThemeToggle />

          {/* Currency */}
          <Card className='w-full'>
            <CardContent className="flex items-center justify-between">
              <div>
                <span className="text-sm font-medium">Default Currency</span>
                <p className="text-xs text-muted-foreground">Select your primary display currency</p>
              </div>
              <Select value={currency} onValueChange={handleCurrencyChange} disabled={isUpdatingCurrency}>
                <SelectTrigger className="w-[120px] h-8 text-xs font-semibold">
                  <SelectValue placeholder="Currency" />
                </SelectTrigger>
                <SelectContent>
                  {AVAILABLE_CURRENCIES.map((c) => (
                    <SelectItem key={c.code} value={c.code} className="text-xs">
                      {c.code} ({c.symbol})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>
        </div>

      </section>
  </React.Fragment>
)}