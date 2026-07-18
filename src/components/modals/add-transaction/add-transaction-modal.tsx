'use client'

import { useCallback, useState } from 'react'
import { Plus } from 'lucide-react'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription
} from '@/components/ui/dialog'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'

import { ExpenseForm } from './expense-form'
import { IncomeForm } from './income-form'
import { TransferForm } from './transfer-form'

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
          size="icon"
          className=" rounded-md transition-all duration-300 hover:scale-105"
          aria-label="Add transaction"
        >
          <Plus size={18} strokeWidth={2.5} aria-hidden />
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
          <TabsList className='w-full items-center'>
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