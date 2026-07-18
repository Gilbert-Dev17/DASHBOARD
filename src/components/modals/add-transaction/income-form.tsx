'use client'

import { zodResolver } from "@hookform/resolvers/zod"
import { Controller, useForm } from "react-hook-form"
import { toast } from "sonner"

import { FieldError, FieldGroup, FieldLabel, FieldSeparator } from "@/components/ui/field"
import {
  Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

import { incomeSchema, IncomeFormValues } from './schemas'
import { useWallets } from '@/hooks/useFinanceData'

const INCOME_SOURCES = [
  { dbId: '1', name: 'Salary' },
  { dbId: '2', name: 'Freelance' },
  { dbId: '3', name: 'Investment' },
  { dbId: '4', name: 'Refund' },
  { dbId: '5', name: 'Gift' },
  { dbId: '6', name: 'Other' },
]

export const IncomeForm = () => {
  const {
    handleSubmit, control, reset, formState: { errors },
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

  function onSubmit(data: IncomeFormValues) {
    try {
      toast.success(<span>{data.amount} added to {data.accountId} successfully!</span>)
      console.log('Form data:', data)
      reset()
    } catch (error) {
      toast.error('Failed to add income')
    }
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
              type="number"
              placeholder="0.00"
              step="0.01"
              {...field}
              value={field.value ?? ''}
              className="text-3xl h-14 text-center font-semibold font-mono"
            />
          )}
        />
        {errors.amount && (
          <FieldError>{errors.amount.message}</FieldError>
        )}
      </FieldGroup>

      {/* Account & Source side-by-side */}
      <div className="flex flex-row gap-4">
        <FieldGroup>
          <FieldLabel>Account</FieldLabel>
          <Controller
            control={control}
            name="accountId"
            render={({ field }) => (
              <Select value={field.value || undefined} onValueChange={field.onChange}>
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
                        <SelectItem key={wallet.id} value={wallet.name}>
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
          <FieldLabel>Source</FieldLabel>
          <Controller
            control={control}
            name="source"
            render={({ field }) => (
              <Select value={field.value || undefined} onValueChange={field.onChange}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Income source" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {INCOME_SOURCES.map((src) => (
                      <SelectItem key={src.dbId} value={src.dbId}>
                        {src.name}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            )}
          />
          {errors.source && (
            <FieldError>{errors.source.message}</FieldError>
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
              placeholder="Where did this come from?"
              {...field}
            />
          )}
        />
      </FieldGroup>

      <Button type="submit" size="lg" className="w-full">
        Add Income
      </Button>
    </form>
  )
}
