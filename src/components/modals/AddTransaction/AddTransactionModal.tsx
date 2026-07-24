'use client'

import { useCallback, useState } from 'react'
import { Plus } from 'lucide-react'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription
} from '@/components/ui/dialog'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'

import { ExpenseForm } from './ExpenseForm'
import { IncomeForm } from './IncomeForm'
import { TransferForm } from './TransferForm'

import { useGlobalShortcut } from '@/hooks/useGlobalShortcut'

export function AddTransactionModal() {
  const [open, setOpen] = useState(false);

  const handleTrigger = useCallback(() => setOpen((prev) => !prev), [])
    useGlobalShortcut({ key: 'k', onTrigger: handleTrigger })

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="default"
          className="rounded-md h-12 flex justify-start items-center p-0 transition-all duration-300 overflow-hidden w-12 group-hover:w-36"
          aria-label="Add transaction"
        >
          <div className="w-12 h-12 flex items-center justify-center shrink-0">
            <Plus size={20} strokeWidth={2.5} aria-hidden />
          </div>
          <div className="flex items-center overflow-hidden transition-all duration-300 w-0 opacity-0 group-hover:w-full group-hover:opacity-100">
            <span className="text-sm font-medium whitespace-nowrap">
              Transaction
            </span>
          </div>
        </Button>
      </DialogTrigger>

      <DialogContent aria-describedby={undefined} className="sm:max-w-lg">
       <DialogHeader>
          <DialogTitle className="font-bold">Finance Form</DialogTitle>
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