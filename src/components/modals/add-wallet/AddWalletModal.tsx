'use client'

import { useState } from 'react'
import { Plus, Wallet} from 'lucide-react'
import {
   Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription
} from '@/components/ui/dialog'
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
import { addWalletAction } from '@/lib/actions/transactions'
import { WalletType } from '@/types/database'
import { WALLET_TYPES, WALLET_STYLES, AVAILABLE_CURRENCIES } from '@/lib/constants/currencies'
import { formatInputAmount } from '@/utils/currency'

const walletSchema = z.object({
  name: z.string().min(1, 'Wallet name is required'),
  balance: z.coerce.number().default(0),
  currency: z.string().min(1, 'Please select a currency'),
  type: z.enum(['Debit', 'Assets', 'Stocks', 'Crypto', 'Credit', 'Loans']),
})

type WalletFormValues = z.infer<typeof walletSchema>

export const AddWalletModal = () => {
  const [isOpen, setIsOpen] = useState(false)
  const queryClient = useQueryClient()

  const { register, handleSubmit, control, watch, reset, formState: { errors } } = useForm<WalletFormValues>({
    resolver: zodResolver(walletSchema as any),
    defaultValues: {
      name: '',
      balance: 0,
      currency: 'PHP',
      type: 'Debit',
    }
  })

  const currentType = watch('type') as WalletType
  const currentName = watch('name')
  const styleInfo = WALLET_STYLES[currentType] || WALLET_STYLES.Debit

  const { mutate: addWallet, isPending } = useMutation({
    mutationFn: addWalletAction,
    onSuccess: (result) => {
      if (!result.success) {
        toast.error(result.error || 'Failed to add wallet')
        return
      }
      toast.success('Wallet created successfully!')
      reset()
      queryClient.invalidateQueries({ queryKey: ['wallets'] })
      setIsOpen(false)
    },
    onError: () => {
      toast.error('An unexpected error occurred')
    }
  })

  const onSubmit = (data: WalletFormValues) => {
    const style = WALLET_STYLES[data.type as WalletType];
    addWallet({
      name: data.name,
      balance: data.balance,
      currency: data.currency,
      type: data.type as WalletType,
      icon: style.iconName,
      color: style.color
    })
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" className="flex items-center gap-2">
          <Plus size={16} />
          Add Wallet
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogHeader >
            <DialogTitle className="font-bold">
              Add Wallet
            </DialogTitle>
            <DialogDescription >
              Create a new wallet to track your finances.
            </DialogDescription>
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
                className="mb-2 block text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground"
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
                <FieldLabel className="mb-2 block text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
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
                          {WALLET_TYPES.map((wallet) => (
                          <SelectItem key={wallet.value} value={wallet.value} >{wallet.label}</SelectItem>
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
                <FieldLabel className="mb-2 block text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
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
                          {AVAILABLE_CURRENCIES.map((curr) => (
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

            {/* Initial Balance */}
            <Field>
              <FieldLabel
                htmlFor="wallet-balance"
                className="mb-2 block text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground"
              >
                {currentType === 'Credit' || currentType === 'Loans' ? 'CURRENT BALANCE (OWED)' : 'INITIAL BALANCE'}
              </FieldLabel>
              <Controller
                control={control}
                name="balance"
                render={({ field }) => (
                  <Input
                    id="wallet-balance"
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
              {errors.balance && <FieldError>{errors.balance.message}</FieldError>}
            </Field>
          </FieldGroup>

          <div className="mt-8 flex justify-end">
            <Button
              type="submit"
              size="lg"
              className="w-full font-semibold shadow-sm"
              disabled={isPending}
            >
              {isPending ? 'Adding...' : 'Add Wallet'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
