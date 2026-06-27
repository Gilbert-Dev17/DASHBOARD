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

      <DialogContent aria-describedby={undefined}>
        <DialogHeader>
          <DialogTitle>New Transaction</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="expense">
          <TabsList className="w-full">
            <TabsTrigger value="expense">Expense</TabsTrigger>
            <TabsTrigger value="income">Income</TabsTrigger>
          </TabsList>

          <TabsContent value="expense" className="mt-4">
            <ExpenseForm />
          </TabsContent>
          <TabsContent value="income" className="mt-4">
            <IncomeForm />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}