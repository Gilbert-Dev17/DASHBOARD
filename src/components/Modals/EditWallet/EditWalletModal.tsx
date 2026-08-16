'use client'

import { useEffect } from 'react'

import { Edit, Wallet as WalletIcon } from 'lucide-react'
import {
  ResponsiveDialog as Dialog,
  ResponsiveDialogContent as DialogContent,
  ResponsiveDialogHeader as DialogHeader,
  ResponsiveDialogTitle as DialogTitle
} from '@/components/ui/responsive-dialog'
import { Field, FieldGroup, FieldError, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Controller, useForm } from 'react-hook-form'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { updateWalletAction } from '@/lib/actions/transactions'
import { WalletType, Wallet } from '@/types/database'
import { WALLET_STYLES } from '@/lib/constants/currencies'
import { WALLET_TYPE_OPTIONS, CURRENCY_OPTIONS } from '@/lib/constants/options'

const walletSchema = z.object({
  name: z.string().min(1, 'Wallet name is required'),
  currency: z.string().min(1, 'Please select a currency'),
  type: z.enum(['Debit', 'Assets', 'Stocks', 'Crypto', 'Credit', 'Loans']),
})

type WalletFormValues = z.infer<typeof walletSchema>

interface EditWalletModalProps {
  wallet: Wallet;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

export const EditWalletModal = ({ wallet, isOpen, setIsOpen }: EditWalletModalProps) => {
  const queryClient = useQueryClient()

  const { register, handleSubmit, control, watch, reset, formState: { errors, isDirty } } = useForm<WalletFormValues>({
    resolver: zodResolver(walletSchema) as any,
    defaultValues: {
      name: wallet.name || '',
      currency: wallet.currency || 'PHP',
      type: wallet.type || 'Debit',
    }
  })

  useEffect(() => {
    if (!isOpen) {
      reset()
    }
  }, [isOpen, reset])

  const currentType = watch('type') as WalletType
  const currentName = watch('name')
  const styleInfo = WALLET_STYLES[currentType] || WALLET_STYLES.Debit

  const { mutate: updateWallet, isPending } = useMutation({
    mutationFn: (data: WalletFormValues) => {
      const style = WALLET_STYLES[data.type as WalletType];
      return updateWalletAction(wallet.id, {
        name: data.name,
        currency: data.currency,
        type: data.type as WalletType,
        icon: style.iconName,
        color: style.color
      })
    },
    onSuccess: (result) => {
      if (!result.success) {
        toast.error(result.error || 'Failed to update wallet')
        return
      }
      toast.success('Wallet updated successfully!')
      queryClient.invalidateQueries({ queryKey: ['wallets'] })
      queryClient.invalidateQueries({ queryKey: ['wallet', wallet.id] })
      setIsOpen(false)
    },
    onError: () => {
      toast.error('An unexpected error occurred')
    }
  })

  const onSubmit = (data: WalletFormValues) => {
    updateWallet(data)
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogHeader className="py-2">
            <DialogTitle className="flex items-center gap-2">
              <Edit className="h-5 w-5 text-primary" />
              Edit Account
            </DialogTitle>
          </DialogHeader>

          {/* Live Preview Card */}
          <div className="flex items-center gap-4 p-4 mt-2 rounded-xl border border-border/50 bg-secondary/20 backdrop-blur-sm shadow-sm transition-all duration-300">
            <div
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full shadow-inner transition-colors duration-500"
              style={{ backgroundColor: `${styleInfo.color}20`, color: styleInfo.color }}
            >
              <styleInfo.icon size={24} />
            </div>
            <div className="flex flex-col overflow-hidden">
              <h3 className="font-semibold text-lg truncate">
                {currentName.trim() || 'Account Name'}
              </h3>
              <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">Live Preview</p>
            </div>
          </div>

          <FieldGroup className="mt-4 space-y-5">
            {/* Wallet Name */}
            <Field>
              <FieldLabel
                htmlFor="wallet-name"
                className="mb-2 block text-xs text-muted-foreground"
              >
                ACCOUNT NAME
              </FieldLabel>
                <Controller
                  control={control}
                  name="name"
                  render={({field}) => (
                    <Input
                      id="wallet-name"
                      placeholder="e.g., Main Bank, Cash, Credit Card..."
                      {...field}
                      className="h-12 bg-background/50 border-border/50 focus:bg-background transition-colors"
                    />
                  )}>
                </Controller>
              {errors.name && <FieldError>{errors.name.message}</FieldError>}
            </Field>

            <div className="grid grid-cols-2 gap-4">
              {/* Wallet Type */}
              <Field>
                <FieldLabel className="mb-2 block text-xs text-muted-foreground">
                  ACCOUNT TYPE
                </FieldLabel>
                <Controller
                  control={control}
                  name="type"
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger className="h-12 bg-background/50 border-border/50 focus:bg-background transition-colors">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          {WALLET_TYPE_OPTIONS.map((walletType) => (
                          <SelectItem key={walletType.value} value={walletType.value} >{walletType.label}</SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.type && <FieldError>{errors.type.message}</FieldError>}
              </Field>

              {/* Currency */}
              <Field>
                <FieldLabel className="mb-2 block text-xs text-muted-foreground">
                  CURRENCY
                </FieldLabel>
                 <Controller
                  control={control}
                  name="currency"
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger className="h-12 bg-background/50 border-border/50 focus:bg-background transition-colors">
                        <SelectValue placeholder="Select currency" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          {CURRENCY_OPTIONS.map((curr) => (
                            <SelectItem key={curr.code} value={curr.code}>
                              {curr.code} ({curr.symbol}) - {curr.name}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.currency && <FieldError>{errors.currency.message}</FieldError>}
              </Field>
            </div>
          </FieldGroup>

          <div className="mt-8 flex justify-end">
            <Button
              type="submit"
              size="lg"
              className="w-full font-semibold shadow-sm"
              disabled={isPending || !isDirty}
            >
              {isPending ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
