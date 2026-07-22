'use client'

import React from 'react'
import { cn } from '@/lib/utils'

interface CurrencySwitcherProps {
  currencies: string[];
  activeCurrency: string;
  onCurrencyChange: (currency: string) => void;
}

export function CurrencySwitcher({ currencies, activeCurrency, onCurrencyChange }: CurrencySwitcherProps) {
  if (!currencies || currencies.length <= 1) return null;

  return (
    <div className="inline-flex h-9 items-center justify-center rounded-lg bg-muted p-1 text-muted-foreground">
      {currencies.map((currency) => {
        const isActive = currency === activeCurrency;
        return (
          <button
            key={currency}
            onClick={() => onCurrencyChange(currency)}
            className={cn(
              "inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
              isActive ? "bg-background text-foreground shadow-sm" : "hover:bg-muted/80 hover:text-foreground"
            )}
          >
            {currency}
          </button>
        )
      })}
    </div>
  )
}
