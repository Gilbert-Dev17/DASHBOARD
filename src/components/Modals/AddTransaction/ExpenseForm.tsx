'use client'

import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { Controller, useForm } from "react-hook-form"
import { toast } from "sonner"

import { FieldError, FieldGroup, FieldLabel, FieldSeparator } from "@/components/ui/field"
import {
  Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Calendar as CalendarIcon } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { AddCategoryModal } from "../AddCategory/AddCategoryModal"
import { AddWalletModal } from "../AddWallet/AddWalletModal"
import { Spinner } from "@/components/ui/spinner"
import { BulkExpenseForm } from "./BulkExpenseForm"

import { expenseSchema, ExpenseFormValues } from './schemas'
import { useWallets, useExpenseCategories } from '@/hooks/useFinanceData'
import { addExpenseAction } from '@/lib/actions/transactions'
import { formatInputAmount, formatCurrency } from '@/utils/currency'
import { PageHeader } from "@/components/Shared/PageHeader"

interface ExpenseFormProps {
  onModeChange?: (mode: 'single' | 'bulk') => void
}

export const ExpenseForm = ({ onModeChange }: ExpenseFormProps) => {
  const [mode, setMode] = useState<'single' | 'bulk'>('single')

  function handleModeChange(next: 'single' | 'bulk') {
    setMode(next)
    onModeChange?.(next)
  }

  const {
    handleSubmit, control, watch, reset, setError, formState: { errors },
  } = useForm<ExpenseFormValues>({
    resolver: zodResolver(expenseSchema) as any,
    defaultValues: {
      amount: '' as unknown as number,
      accountId: '',
      categoryId: '',
      note: '',
      date: undefined,
    }
  })

  const { data: wallets = [], isPending: isWalletsPending } = useWallets()
  const { data: categories = [], isPending: isCategoriesPending } = useExpenseCategories()
  const [isAddCategoryOpen, setIsAddCategoryOpen] = useState(false)
  const [isAddWalletOpen, setIsAddWalletOpen] = useState(false)

  const queryClient = useQueryClient()

  const { mutate: addExpense, isPending: isSubmitting } = useMutation({
    mutationFn: addExpenseAction,
    onSuccess: (result) => {
      if (!result.success) {
        toast.error(result.error || 'Failed to add expense')
        return
      }
      toast.success('Expense logged successfully!')
      reset()
      queryClient.invalidateQueries({ queryKey: ['wallets'] })
      queryClient.invalidateQueries({ queryKey: ['transactions'] })
      queryClient.invalidateQueries({ queryKey: ['expense_categories'] })
    },
    onError: () => {
      toast.error('An unexpected error occurred')
    }
  })

  const selectedWallet = wallets.find(w => w.id === watch('accountId'))

  function onSubmit(data: ExpenseFormValues) {
    if (selectedWallet && Number(data.amount) > selectedWallet.balance) {
      setError('amount', { type: 'manual', message: 'Insufficient balance in wallet' })
      return
    }

    addExpense({
      amount: data.amount,
      accountId: data.accountId,
      categoryId: data.categoryId,
      note: data.note,
      date: data.date ? format(data.date, 'yyyy-MM-dd') : undefined,
    })
  }

  return (
    <div className="flex flex-col gap-4">

      <PageHeader title="Add Expense"
        children={
          <div className="flex items-center self-end rounded-md border border-border/50 overflow-hidden">
            <button
              type="button"
              onClick={() => handleModeChange('single')}
              className={cn(
                'px-3 py-1 font-mono text-[11px] uppercase tracking-wider transition-colors',
                mode === 'single'
                  ? 'bg-foreground text-background'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              Single
            </button>
            <button
              type="button"
              onClick={() => handleModeChange('bulk')}
              className={cn(
                'px-3 py-1 font-mono text-[11px] uppercase tracking-wider transition-colors',
                mode === 'bulk'
                  ? 'bg-foreground text-background'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              Bulk
            </button>
          </div>
        }
      />

      {mode === 'bulk' ? (
        <BulkExpenseForm />
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          {/* Amount */}
          <FieldGroup>
            <FieldLabel>Amount</FieldLabel>
            <Controller
              control={control}
              name="amount"
              render={({ field }) => (
                <Input
                  type="text"
                  inputMode="decimal"
                  placeholder="0.00"
                  {...field}
                  value={field.value ? formatInputAmount(String(field.value)) : ''}
                  onChange={(e) => {
                    const rawValue = e.target.value.replace(/,/g, '')
                    const sanitized = rawValue.replace(/[^0-9.]/g, '')
                    const parts = sanitized.split('.')
                    let finalValue = sanitized
                    if (parts.length > 2) {
                      finalValue = parts[0] + '.' + parts.slice(1).join('')
                    }
                    field.onChange(finalValue)
                  }}
                  className="text-3xl h-14 text-center font-semibold"
                />
              )}
            />
            {errors.amount && (
              <FieldError>{errors.amount.message}</FieldError>
            )}
          </FieldGroup>

          {/* Account & Category side-by-side on desktop, stacked on mobile */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FieldGroup>
              <div className="flex justify-between items-center">
                <FieldLabel className="mb-0">Account</FieldLabel>
                {selectedWallet && (
                  <span className="text-xs text-muted-foreground font-medium">
                    Bal: {formatCurrency(selectedWallet.balance, selectedWallet.currency || 'PHP')}
                  </span>
                )}
              </div>
              <Controller
                control={control}
                name="accountId"
                render={({ field }) => (
                  <Select
                    value={field.value}
                    onValueChange={(val) => {
                      if (val === 'add_wallet') {
                        setIsAddWalletOpen(true)
                      } else {
                        field.onChange(val)
                      }
                    }}
                    >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select account" />
                    </SelectTrigger>
                    <SelectContent className="max-h-56">
                      <SelectGroup>
                        {isWalletsPending ? (
                          <SelectItem disabled value="loading">Loading...</SelectItem>
                        ) : wallets.length === 0 ? (
                          <SelectItem value="empty">No wallets found</SelectItem>
                        ) : (
                          wallets.map((wallet) => (
                            <SelectItem key={wallet.id} value={wallet.id}>
                              {wallet.name} &bull; {wallet.type} - {wallet.currency}
                            </SelectItem>
                          ))
                        )}

                        <div className="h-px bg-border my-1 mx-2" />

                        <SelectItem value="add_wallet" className="font-medium text-primary" >
                          + Add Wallet
                        </SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.accountId && (
                <FieldError>{errors.accountId.message}</FieldError>
              )}
            </FieldGroup>

            <FieldGroup>
              <FieldLabel>Category</FieldLabel>
              <Controller
                control={control}
                name="categoryId"
                render={({ field }) => (
                  <Select
                    value={field.value}
                    onValueChange={(val) => {
                      if (val === 'add_category') {
                        setIsAddCategoryOpen(true)
                      } else {
                        field.onChange(val)
                      }
                    }}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent className="max-h-56">
                      <SelectGroup>
                      {isCategoriesPending ? (
                        <SelectItem disabled value="loading">
                          Loading...
                        </SelectItem>
                      ) : categories.length === 0 ? (
                        <SelectItem value="empty" disabled>
                          No categories
                        </SelectItem>
                      ) : (
                        categories.map((category) => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.name}
                            </SelectItem>
                          ))
                        )}

                        <div className="h-px bg-border my-1 mx-2" />

                        <SelectItem value="add_category" className="font-medium text-primary" >
                          + Add Category
                        </SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.categoryId && (
                <FieldError>{errors.categoryId.message}</FieldError>
              )}
            </FieldGroup>

            <AddCategoryModal
              isControlled={true}
              open={isAddCategoryOpen}
              onOpenChange={setIsAddCategoryOpen}
            />

            <AddWalletModal
              isControlled={true}
              open={isAddWalletOpen}
              onOpenChange={setIsAddWalletOpen}
            />
          </div>

          <FieldSeparator />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FieldGroup>
              <FieldLabel>Date</FieldLabel>
              <Controller
                control={control}
                name="date"
                render={({ field }) => (
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal border-border/50",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {field.value ? format(field.value, "PPP") : <span>Today</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                      />
                    </PopoverContent>
                  </Popover>
                )}
              />
            </FieldGroup>

            <FieldGroup>
              <FieldLabel>Note</FieldLabel>
              <Controller
                control={control}
                name="note"
                render={({ field }) => (
                  <Input
                    type="text"
                    placeholder="What was this for?"
                    {...field}
                  />
                )}
              />
            </FieldGroup>
          </div>

          <Button type="submit" size="lg" className="w-full" disabled={!watch('amount') || !watch('accountId') || !watch('categoryId') || isSubmitting}>
              {isSubmitting ?
              <span className="inline-flex items-center gap-2">
                Adding <Spinner />
              </span> : 'Add Expense'}
          </Button>
        </form>
      )}
    </div>
  )
}
