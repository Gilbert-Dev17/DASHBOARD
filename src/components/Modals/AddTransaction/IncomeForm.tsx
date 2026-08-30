'use client'

import { zodResolver } from "@hookform/resolvers/zod"
import { Controller, useForm } from "react-hook-form"
import { toast } from "sonner"
import { useState } from "react"

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
import { Spinner } from "@/components/ui/spinner"

import { incomeSchema, IncomeFormValues } from './schemas'
import { useWallets } from '@/hooks/useFinanceData'
import { addIncomeAction } from '@/lib/actions/transactions'
import { formatInputAmount } from '@/utils/currency'
import { AddWalletModal } from "../AddWallet/AddWalletModal"

export const IncomeForm = () => {
  const {
    handleSubmit, control, watch, reset, formState: { errors },
  } = useForm<IncomeFormValues>({
    resolver: zodResolver(incomeSchema) as any,
    defaultValues: {
      amount: '' as unknown as number,
      accountId: '',
      source: '',
      note: '',
      date: undefined,
    }
  })

  const { data: wallets = [], isPending: isWalletsPending } = useWallets()

  const queryClient = useQueryClient()
  const [isAddWalletOpen, setIsAddWalletOpen] = useState(false)

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
      date: data.date ? format(data.date, 'yyyy-MM-dd') : undefined,
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
              <Select
                value={field.value}
                onValueChange={(val) => {
                  if (val === 'add_wallet'){
                    setIsAddWalletOpen(true)
                  } else {
                    field.onChange(val)
                  }
                }}
                >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Deposit to" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>

                    <SelectItem value="add_wallet" className="font-medium text-primary" >
                      + Add Wallet
                    </SelectItem>

                    <div className="h-px bg-border my-1 mx-2" />

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
                  </SelectGroup>
                </SelectContent>
              </Select>
            )}
          />
          {errors.accountId && (
            <FieldError>{errors.accountId.message}</FieldError>
          )}

          <AddWalletModal
              isControlled={true}
              open={isAddWalletOpen}
              onOpenChange={setIsAddWalletOpen}
            />
        </FieldGroup>

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
                placeholder="Where did this come from?"
                {...field}
              />
            )}
          />
        </FieldGroup>
      </div>

      <Button type="submit" size="lg" className="w-full rounded-md" disabled={!watch('amount') || !watch('accountId') || isSubmitting}>
        {isSubmitting ?
          <span className="inline-flex items-center gap-2">
            Adding <Spinner />
          </span> : 'Add Income'}
      </Button>
    </form>
  )
}
