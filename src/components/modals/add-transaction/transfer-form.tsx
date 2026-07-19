'use client'

import { zodResolver } from "@hookform/resolvers/zod"
import { Controller, useForm } from "react-hook-form"
import { toast } from "sonner"
import { ArrowRight } from 'lucide-react'

import { FieldError, FieldGroup, FieldLabel, FieldSeparator } from "@/components/ui/field"
import {
  Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

import { transferSchema, TransferFormValues } from './schemas'
import { useWallets } from '@/hooks/useFinanceData'
import { addTransferAction } from '@/lib/actions/transactions'
import { formatInputAmount } from '@/utils/currency'


export const TransferForm = () => {
  const {
    handleSubmit, control, reset, watch, formState: { errors },
  } = useForm<TransferFormValues>({
    resolver: zodResolver(transferSchema as any),
    defaultValues: {
      amount: '' as any,
      fromAccountId: '',
      toAccountId: '',
      transferFee: '' as any,
      note: '',
    }
  })

  const currentFromAccount = watch('fromAccountId')
  const currentToAccount = watch('toAccountId')

  const { data: wallets = [], isPending: isWalletsPending } = useWallets()

  const queryClient = useQueryClient()

  const { mutate: addTransfer, isPending: isSubmitting } = useMutation({
    mutationFn: addTransferAction,
    onSuccess: (result) => {
      if (!result.success) {
        toast.error(result.error || 'Failed to complete transfer')
        return
      }
      toast.success('Transfer completed!')
      reset()
      queryClient.invalidateQueries({ queryKey: ['wallets'] })
      queryClient.invalidateQueries({ queryKey: ['transactions'] })
    },
    onError: () => {
      toast.error('An unexpected error occurred')
    }
  })

  function onSubmit(data: TransferFormValues) {
    addTransfer({
      amount: data.amount,
      fromAccountId: data.fromAccountId,
      toAccountId: data.toAccountId,
      transferFee: data.transferFee,
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

      {/* From → To accounts */}
      <div className="flex flex-row items-end gap-2">
        <FieldGroup>
          <FieldLabel>From</FieldLabel>
          <Controller
            control={control}
            name="fromAccountId"
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Source" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {isWalletsPending ? (
                      <SelectItem disabled value="loading">Loading...</SelectItem>
                    ) : wallets.length === 0 ? (
                      <SelectItem disabled value="empty">No wallets found</SelectItem>
                    ) : (
                      wallets.map((wallet) => (
                        <SelectItem
                          key={wallet.id}
                          value={wallet.id}
                          disabled={wallet.id === currentToAccount}
                        >
                          {wallet.name} - {wallet.currency}
                        </SelectItem>
                      ))
                    )}
                  </SelectGroup>
                </SelectContent>
              </Select>
            )}
          />
          {errors.fromAccountId && (
            <FieldError>{errors.fromAccountId.message}</FieldError>
          )}
        </FieldGroup>

        {/* <div className="flex items-center justify-center pb-1">
          <ArrowRight size={16} className="text-muted-foreground" />
        </div> */}

        <FieldGroup>
          <FieldLabel>To</FieldLabel>
          <Controller
            control={control}
            name="toAccountId"
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Destination" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {isWalletsPending ? (
                      <SelectItem disabled value="loading">Loading...</SelectItem>
                    ) : wallets.length === 0 ? (
                      <SelectItem disabled value="empty">No wallets found</SelectItem>
                    ) : (
                      wallets.map((wallet) => (
                        <SelectItem
                          key={wallet.id}
                          value={wallet.id}
                          disabled={wallet.id === currentFromAccount}
                        >
                          {wallet.name} - {wallet.currency}
                        </SelectItem>
                      ))
                    )}
                  </SelectGroup>
                </SelectContent>
              </Select>
            )}
          />
          {errors.toAccountId && (
            <FieldError>{errors.toAccountId.message}</FieldError>
          )}
        </FieldGroup>
      </div>

      <FieldSeparator />

      {/* Transfer Fee */}
      <FieldGroup>
        <FieldLabel>Transfer Fee <span className="text-muted-foreground">(optional)</span></FieldLabel>
        <Controller
          control={control}
          name="transferFee"
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
              className="font-mono"
            />
          )}
        />
      </FieldGroup>

      {/* Note */}
      <FieldGroup>
        <FieldLabel>Note</FieldLabel>
        <Controller
          control={control}
          name="note"
          render={({ field }) => (
            <Input
              type="text"
              placeholder="What's this transfer for?"
              {...field}
            />
          )}
        />
      </FieldGroup>

      <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? 'Transferring...' : 'Transfer'}
      </Button>
    </form>
  )
}
