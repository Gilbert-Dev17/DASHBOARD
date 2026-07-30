'use client'

import { cn } from '@/lib/utils'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { ChevronDown, Banknote } from "lucide-react"

interface CurrencySwitcherProps {
  currencies: string[];
  activeCurrency: string;
  onCurrencyChange: (currency: string) => void;
}

export function CurrencySwitcher({ currencies, activeCurrency, onCurrencyChange }: CurrencySwitcherProps) {
  if (!currencies || currencies.length <= 1) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="h-9 gap-2 shadow-sm rounded-lg bg-card border-border">
          <Banknote className="w-3.5 h-3.5 text-muted-foreground" />
          <span className="font-medium text-foreground">{activeCurrency}</span>
          <ChevronDown className="w-3.5 h-3.5 text-muted-foreground opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-32 rounded-xl gap-2 space-y-1">
        {currencies.map((currency) => (
          <DropdownMenuItem
            key={currency}
            onClick={() => onCurrencyChange(currency)}
            className={cn(
              "flex items-center justify-between cursor-pointer rounded-lg",
              currency === activeCurrency && "bg-muted font-medium"
            )}
          >
            {currency}
            {currency === activeCurrency && (
              <div className="w-1.5 h-1.5 rounded-full bg-primary" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
