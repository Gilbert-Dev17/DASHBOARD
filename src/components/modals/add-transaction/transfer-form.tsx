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
import { Calendar as CalendarIcon } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

import { transferSchema, TransferFormValues } from './schemas'
import { useWallets } from '@/hooks/useFinanceData'
import { addTransferAction } from '@/lib/actions/transactions'
import { formatInputAmount, formatCurrency } from '@/utils/currency'


export const TransferForm = () => {
  const {
    handleSubmit, control, reset, watch, setError, formState: { errors },
  } = useForm<TransferFormValues>({
    resolver: zodResolver(transferSchema as any),
    defaultValues: {
      amount: '' as any,
      fromAccountId: '',
      toAccountId: '',
      transferFee: '' as any,
      note: '',
      date: undefined,
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

  const selectedFromWallet = wallets.find(w => w.id === currentFromAccount)

  function onSubmit(data: TransferFormValues) {
    if (selectedFromWallet) {
      const totalDeduction = Number(data.amount) + (Number(data.transferFee) || 0)
      if (totalDeduction > selectedFromWallet.balance) {
        setError('amount', { type: 'manual', message: 'Insufficient balance in source wallet (including fee)' })
        return
      }
    }

    addTransfer({
      amount: data.amount,
      fromAccountId: data.fromAccountId,
      toAccountId: data.toAccountId,
      transferFee: data.transferFee,
      note: data.note,
      date: data.date,
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
      <div className="grid grid-cols-2 gap-4">
        <FieldGroup>
          <div className="flex justify-between items-center">
            <FieldLabel className="mb-0">From</FieldLabel>
            {selectedFromWallet && (
              <span className="text-[10px] text-muted-foreground font-medium">
                Bal: {formatCurrency(selectedFromWallet.balance, selectedFromWallet.currency || 'PHP')}
              </span>
            )}
          </div>
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
                      <SelectItem value="empty">No wallets found</SelectItem>
                    ) : (
                      wallets.map((wallet) => (
                        <SelectItem
                          key={wallet.id}
                          value={wallet.id}
                          disabled={wallet.id === currentToAccount}
                        >
                          {wallet.name} &bull; {wallet.type} - {wallet.currency}
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
                      <SelectItem value="empty">No wallets found</SelectItem>
                    ) : (
                      wallets.map((wallet) => (
                        <SelectItem
                          key={wallet.id}
                          value={wallet.id}
                          disabled={wallet.id === currentFromAccount}
                        >
                          {wallet.name} &bull; {wallet.type} - {wallet.currency}
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

      <div className="grid grid-cols-2 gap-4">
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
                placeholder="What's this transfer for?"
                {...field}
              />
            )}
          />
        </FieldGroup>
      </div>

      <Button type="submit" size="lg" className="w-full" disabled={!watch('amount') || !watch('fromAccountId') || !watch('toAccountId') || isSubmitting}>
        {isSubmitting ? 'Transferring...' : 'Transfer'}
      </Button>
    </form>
  )
}
