'use client'

import { useCallback, useState } from 'react'
import { Plus, TrendingDown, TrendingUp, ArrowLeftRight, Tag, Wallet } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandInput,
  Command
} from '@/components/ui/command'
import { useGlobalShortcut } from '@/hooks/useGlobalShortcut'

const TRANSACTION_COMMANDS = [
  {
    group: 'Transactions',
    items: [
      { label: 'Add Expense',  icon: TrendingDown,   href: '/finance/add/expense'  },
      { label: 'Add Income',   icon: TrendingUp,     href: '/finance/add/income'   },
      { label: 'Add Transfer', icon: ArrowLeftRight, href: '/finance/add/transfer' },
    ],
  },
  {
    group: 'Manage',
    items: [
      { label: 'Add Category', icon: Tag,    href: '/finance/add/category' },
      { label: 'Add Wallet',   icon: Wallet, href: '/finance/add/wallet'   },
    ],
  },
]

export function AddTransactionModal({ enableShortcut = true }: { enableShortcut?: boolean }) {
  const [open, setOpen] = useState(false)
  const router = useRouter()

  const handleTrigger = useCallback(() => setOpen((prev) => !prev), [])
  useGlobalShortcut({ key: 'k', onTrigger: handleTrigger, enabled: enableShortcut })

  const handleSelect = (href: string) => {
    setOpen(false)
    router.push(href)
  }

  return (
    <>
      <Button
        variant="default"
        className="rounded-md h-12 flex justify-start items-center p-0"
        aria-label="Add transaction"
        onClick={() => setOpen(true)}
      >
        <div className="w-12 h-12 flex items-center justify-center shrink-0">
          <Plus size={20} strokeWidth={2.5} aria-hidden />
        </div>
      </Button>

      <CommandDialog
        open={open}
        onOpenChange={setOpen}
        title="Quick Add"
        description="Choose what to add to your finances"
      >
        <CommandInput placeholder="Type a command or search..." />
        <CommandList>
          <CommandEmpty>No actions found.</CommandEmpty>
          {TRANSACTION_COMMANDS.map((group, i) => (
            <div key={group.group}>
              {i > 0 && <CommandSeparator />}
              <CommandGroup heading={group.group}>
                {group.items.map(({ label, icon: Icon, href }) => (
                  <CommandItem key={href} onSelect={() => handleSelect(href)}>
                    <Icon />
                    <span>{label}</span>
                  </CommandItem>
                ))}
              </CommandGroup>
            </div>
          ))}
        </CommandList>
      </CommandDialog>
    </>
  )
}