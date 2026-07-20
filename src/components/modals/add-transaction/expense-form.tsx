'use client'

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

import { expenseSchema, ExpenseFormValues } from './schemas'
import { useWallets, useExpenseCategories } from '@/hooks/useFinanceData'
import { addExpenseAction } from '@/lib/actions/transactions'
import { formatInputAmount } from '@/utils/currency'

export const ExpenseForm = () => {
  const {
    handleSubmit, control, watch, reset, formState: { errors },
  } = useForm<ExpenseFormValues>({
    resolver: zodResolver(expenseSchema as any),
    defaultValues: {
      amount: '' as any,
      accountId: '',
      categoryId: '',
      note: '',
    }
  })

  const { data: wallets = [], isPending: isWalletsPending } = useWallets()
  const { data: categories = [], isPending: isCategoriesPending } = useExpenseCategories()

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
      // Refresh all related data on the client
      queryClient.invalidateQueries({ queryKey: ['wallets'] })
      queryClient.invalidateQueries({ queryKey: ['transactions'] })
    },
    onError: () => {
      toast.error('An unexpected error occurred')
    }
  })

  function onSubmit(data: ExpenseFormValues) {
    addExpense({
      amount: data.amount,
      accountId: data.accountId,
      categoryId: data.categoryId,
      note: data.note,
    })
  }

  return (
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

      {/* Account & Category side-by-side */}
      <div className="grid grid-cols-2 gap-4">
        <FieldGroup>
          <FieldLabel>Account</FieldLabel>
          <Controller
            control={control}
            name="accountId"
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select account" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {isWalletsPending ? (
                      <SelectItem disabled value="loading">Loading...</SelectItem>
                    ) : wallets.length === 0 ? (
                      <SelectItem disabled value="empty">No wallets found</SelectItem>
                    ) : (
                      wallets.map((wallet) => (
                        <SelectItem key={wallet.id} value={wallet.id}>
                          {wallet.name} - {wallet.currency}
                        </SelectItem>
                      ))
                    )}
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
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {isCategoriesPending ? (
                      <SelectItem disabled value="loading">Loading...</SelectItem>
                    ) : categories.length === 0 ? (
                      <SelectItem disabled value="empty">No categories</SelectItem>
                    ) : (
                      categories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))
                    )}
                  </SelectGroup>
                </SelectContent>
              </Select>
            )}
          />
          {errors.categoryId && (
            <FieldError>{errors.categoryId.message}</FieldError>
          )}
        </FieldGroup>
      </div>

      <FieldSeparator />

      {/* Note */}
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

      <Button type="submit" size="lg" className="w-full" disabled={!watch('amount') || !watch('accountId') || !watch('categoryId') || isSubmitting}>
        {isSubmitting ? 'Adding...' : 'Add Expense'}
      </Button>
    </form>
  )
}
