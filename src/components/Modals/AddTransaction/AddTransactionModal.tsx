'use client'

import { useCallback, useState } from 'react'
import { Plus } from 'lucide-react'
import {
  ResponsiveDialog as Dialog,
  ResponsiveDialogContent as DialogContent,
  ResponsiveDialogHeader as DialogHeader,
  ResponsiveDialogTitle as DialogTitle,
  ResponsiveDialogTrigger as DialogTrigger,
  ResponsiveDialogDescription as DialogDescription
} from '@/components/ui/responsive-dialog'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'

import { ExpenseForm } from './ExpenseForm'
import { IncomeForm } from './IncomeForm'
import { TransferForm } from './TransferForm'

import { useGlobalShortcut } from '@/hooks/useGlobalShortcut'

export function AddTransactionModal({ enableShortcut = true }: { enableShortcut?: boolean }) {
  const [open, setOpen] = useState(false);

  const handleTrigger = useCallback(() => setOpen((prev) => !prev), [])
    useGlobalShortcut({ key: 'k', onTrigger: handleTrigger, enabled: enableShortcut })

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="default"
          className="rounded-md h-12 flex justify-start items-center p-0"
          aria-label="Add transaction"
        >
          <div className="w-12 h-12 flex items-center justify-center shrink-0">
            <Plus size={20} strokeWidth={2.5} aria-hidden />
          </div>
        </Button>
      </DialogTrigger>

      <DialogContent aria-describedby={undefined} className="sm:max-w-lg">
       <DialogHeader>
          <DialogTitle className="text-base font-semibold">Finance Form</DialogTitle>
         <DialogDescription>
           Add Expense, Income or Transfer Cash to your wallets.
         </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="expense">
          <TabsList className='w-full items-center bg-card border border-border/50'>
            <TabsTrigger value="expense">Expense</TabsTrigger>
            <TabsTrigger value="income">Income</TabsTrigger>
            <TabsTrigger value="transfer">Transfer</TabsTrigger>
          </TabsList>

          <TabsContent value="expense" className="mt-2">
            <ExpenseForm />
          </TabsContent>
          <TabsContent value="income" className="mt-2">
            <IncomeForm />
          </TabsContent>
          <TabsContent value="transfer" className="mt-2">
            <TransferForm />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}