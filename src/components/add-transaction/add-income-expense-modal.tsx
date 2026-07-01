'use client'

import { Plus } from 'lucide-react'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'

import { IncomeForm } from './income-form'
import { ExpenseForm } from './expense-form'

export function AddIncomeExpenseModal() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="default"
          size="icon"
          className="h-10 w-10 rounded-full transition-all duration-300 hover:scale-105"
          aria-label="Add transaction"
        >
          <Plus size={18} strokeWidth={2.5} aria-hidden />
        </Button>
      </DialogTrigger>

      <DialogContent aria-describedby={undefined} className="sm:max-w-sm p-6 overflow-hidden">
        <DialogHeader className="space-y-1">
          <DialogTitle className="text-2xl font-semibold tracking-tight">
            New Transaction
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="expense">
          <TabsList className="w-full rounded-full h-20 bg-muted py-5 px-1">
            <TabsTrigger className='rounded-full p-4 h-3 w-5' value="expense">Expense</TabsTrigger>
            <TabsTrigger className='rounded-full p-4 h-3 w-5' value="income">Income</TabsTrigger>
          </TabsList>

          <TabsContent value="expense" className="mt-2">
            <ExpenseForm />
          </TabsContent>
          <TabsContent value="income" className="mt-2">
            <IncomeForm />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}