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

import { incomeSchema, IncomeFormValues } from './schemas'
import { useWallets } from '@/hooks/useFinanceData'
import { addIncomeAction } from '@/lib/actions/transactions'
import { formatInputAmount } from '@/utils/currency'

export const IncomeForm = () => {
  const {
    handleSubmit, control, watch, reset, formState: { errors },
  } = useForm<IncomeFormValues>({
    resolver: zodResolver(incomeSchema as any),
    defaultValues: {
      amount: '' as any,
      accountId: '',
      source: '',
      note: '',
    }
  })

  const { data: wallets = [], isPending: isWalletsPending } = useWallets()

  const queryClient = useQueryClient()

  const { mutate: addIncome, isPending: isSubmitting } = useMutation({
    mutationFn: addIncomeAction,
    onSuccess: (result) => {
      if (!result.success) {
        toast.error(result.error || 'Failed to add income')
        return
      }
      toast.success('Income logged successfully!')
      reset()
      queryClient.invalidateQueries({ queryKey: ['wallets'] })
      queryClient.invalidateQueries({ queryKey: ['transactions'] })
    },
    onError: () => {
      toast.error('An unexpected error occurred')
    }
  })

  function onSubmit(data: IncomeFormValues) {
    addIncome({
      amount: data.amount,
      accountId: data.accountId,
      source: data.source,
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

      {/* Account & Source side-by-side */}
        <FieldGroup>
          <FieldLabel>Account</FieldLabel>
          <Controller
            control={control}
            name="accountId"
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Deposit to" />
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
                          {wallet.name} &bull; {wallet.type} - {wallet.currency}
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
              placeholder="Where did this come from?"
              {...field}
            />
          )}
        />
      </FieldGroup>

      <Button type="submit" size="lg" className="w-full" disabled={!watch('amount') || !watch('accountId') || isSubmitting}>
        {isSubmitting ? 'Adding...' : 'Add Income'}
      </Button>
    </form>
  )
}
