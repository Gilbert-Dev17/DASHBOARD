'use client'

import { useEffect } from 'react'

import { Scale } from 'lucide-react'
import {
  ResponsiveDialog as Dialog,
  ResponsiveDialogContent as DialogContent,
  ResponsiveDialogHeader as DialogHeader,
  ResponsiveDialogTitle as DialogTitle,
  ResponsiveDialogDescription as DialogDescription,
  ResponsiveDialogFooter as DialogFooter
} from '@/components/ui/responsive-dialog'
import { Field, FieldGroup, FieldError, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Controller, useForm } from 'react-hook-form'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { adjustBalanceAction } from '@/lib/actions/transactions'
import { Wallet } from '@/types/database'
import { formatCurrency, formatInputAmount } from '@/utils/currency'

const adjustSchema = z.object({
  newBalance: z.preprocess((val) => {
    if (typeof val === 'string') {
      return Number(val.replace(/,/g, ''))
    }
    return Number(val)
  }, z.number({ error: 'Enter a valid number' }).min(0, 'Balance cannot be negative')),
  note: z.string().max(100, 'Note must be 100 characters or less').optional(),
})

type AdjustFormValues = z.infer<typeof adjustSchema>

interface AdjustBalanceModalProps {
  wallet: Wallet
  isOpen: boolean
  setIsOpen: (open: boolean) => void
}

export const AdjustBalanceModal = ({ wallet, isOpen, setIsOpen }: AdjustBalanceModalProps) => {
  const queryClient = useQueryClient()

  const {reset, handleSubmit, control, watch, formState: { errors } } = useForm<AdjustFormValues>({
    resolver: zodResolver(adjustSchema) as any,
    defaultValues: {
      newBalance: wallet.balance,
      note: '',
    }
  })

  const newBalance = watch('newBalance')
  const difference = (Number(newBalance) || 0) - wallet.balance
  const hasDifference = difference !== 0

  useEffect(() => {
    if (!isOpen) {
      reset()
    }
  }, [isOpen, reset])

  const { mutate: adjustBalance, isPending } = useMutation({
    mutationFn: (data: AdjustFormValues) =>
      adjustBalanceAction({
        walletId: wallet.id,
        newBalance: data.newBalance,
        note: data.note || undefined,
      }),
    onSuccess: (result) => {
      if (!result.success) {
        toast.error(result.error || 'Failed to adjust balance')
        return
      }
      toast.success('Balance adjusted successfully')
      queryClient.invalidateQueries({ queryKey: ['wallets'] })
      queryClient.invalidateQueries({ queryKey: ['wallet', wallet.id] })
      setIsOpen(false)
    },
    onError: () => {
      toast.error('An unexpected error occurred')
    }
  })

  const onSubmit = (data: AdjustFormValues) => {
    adjustBalance(data)
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen }>
      <DialogContent className="sm:max-w-sm">
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogHeader className="py-2">
            <DialogTitle className="flex items-center gap-2">
              <Scale className="h-5 w-5" />
              Adjust Balance
            </DialogTitle>
            <DialogDescription>
              The difference will be recorded as a transaction.
            </DialogDescription>
          </DialogHeader>

          <FieldGroup className="mt-4 space-y-5">
            {/* Current balance — read only */}
            <Field className='flex flex-col items-center gap-2'>
              <FieldLabel className="mb-2 text-xs text-muted-foreground w-full flex items-center justify-between">
                CURRENT BALANCE
                {/* Difference indicator */}
                {hasDifference && (
                  <span className={`text-sm font-mono ${difference > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                    {difference > 0 ? '+' : ''}{formatCurrency(difference, wallet.currency)}
                  </span>
                )}
              </FieldLabel>
              <div className="text-2xl font-mono tracking-tight text-muted-foreground px-3 py-2 text-center w-full">
                {formatCurrency(wallet.balance, wallet.currency)}
              </div>
            </Field>

            {/* New balance input */}
            <Field>
              <FieldLabel htmlFor="new-balance" className="mb-2 block text-xs text-muted-foreground">
                NEW BALANCE
              </FieldLabel>
              <Controller
                control={control}
                name="newBalance"
                render={({ field }) => (
                  <Input
                    id="new-balance"
                    type="text"
                    inputMode="decimal"
                    placeholder="0.00"
                    autoFocus
                    {...field}
                    value={field.value !== undefined ? formatInputAmount(String(field.value)) : ''}
                    onChange={(e) => {
                      const rawValue = e.target.value.replace(/,/g, '')
                      const sanitized = rawValue.replace(/[^0-9.-]/g, '')
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
              {errors.newBalance && <FieldError>{errors.newBalance.message}</FieldError>}
            </Field>


            {/* Note */}
            <Field>
              <FieldLabel htmlFor="adjust-note" className="mb-2 block text-xs text-muted-foreground">
                NOTE (OPTIONAL)
              </FieldLabel>
              <Controller
                control={control}
                name="note"
                render={({ field }) => (
                  <Input
                    id="adjust-note"
                    placeholder="e.g., Bank sync correction, found cash..."
                    {...field}
                    className="h-12 bg-background/50 border-border/50"
                  />
                )}
              />
              {errors.note && <FieldError>{errors.note.message}</FieldError>}
            </Field>
          </FieldGroup>

          <DialogFooter className="mt-8">
            <Button
              type="submit"
              size="lg"
              className="w-full font-semibold"
              disabled={isPending || !hasDifference}
            >
              {isPending ? 'Adjusting...' : 'Confirm Adjustment'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
