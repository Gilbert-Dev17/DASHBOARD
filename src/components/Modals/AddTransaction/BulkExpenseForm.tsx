'use client'

import { useState } from 'react'
import { useForm, useFieldArray, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { format } from 'date-fns'
import { X, CalendarIcon, Plus } from 'lucide-react'

import { bulkExpenseFormSchema, BulkExpenseFormValues } from './schemas'
import { useWallets, useExpenseCategories } from '@/hooks/useFinanceData'
import { addExpenseAction } from '@/lib/actions/transactions'
import { formatInputAmount } from '@/utils/currency'
import { AddCategoryModal } from '../AddCategory/AddCategoryModal'
import { AddWalletModal } from '../AddWallet/AddWalletModal'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Spinner } from '@/components/ui/spinner'
import {
  Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import {
  Popover, PopoverContent, PopoverTrigger,
} from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import { cn } from '@/lib/utils'
import { useQueryClient } from '@tanstack/react-query'

const EMPTY_ROW = { amount: '', accountId: '', categoryId: '', note: '' }

type RowStatus = 'blank' | 'partial' | 'valid'

function classifyRow(row: BulkExpenseFormValues['rows'][number]): RowStatus {
  const hasAmount   = row.amount.trim() !== ''
  const hasAccount  = row.accountId !== ''
  const hasCategory = row.categoryId !== ''

  if (!hasAmount && !hasAccount && !hasCategory) return 'blank'
  if (hasAmount && hasAccount && hasCategory)     return 'valid'
  return 'partial'
}

export function BulkExpenseForm() {
  const [isAddCategoryOpen, setIsAddCategoryOpen] = useState(false)
  const [isAddWalletOpen, setIsAddWalletOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { data: wallets = [], isPending: isWalletsPending }     = useWallets()
  const { data: categories = [], isPending: isCategoriesPending } = useExpenseCategories()
  const queryClient = useQueryClient()

  const { control, handleSubmit, watch, setError, clearErrors, formState: { errors } } =
    useForm<BulkExpenseFormValues>({
      resolver: zodResolver(bulkExpenseFormSchema) as any,
      defaultValues: {
        date: undefined,
        rows: [EMPTY_ROW, EMPTY_ROW],
      },
    })

  const { fields, append, remove } = useFieldArray({ control, name: 'rows' })

  const rows       = watch('rows')
  const validCount = rows.filter(r => classifyRow(r) === 'valid').length

  async function onSubmit(data: BulkExpenseFormValues) {
    const classified = data.rows.map((row, i) => ({ row, i, status: classifyRow(row) }))
    const partials   = classified.filter(r => r.status === 'partial')
    const blanks     = classified.filter(r => r.status === 'blank')
    const valids     = classified.filter(r => r.status === 'valid')

    // Block if any partial rows — show inline errors
    if (partials.length > 0) {
      partials.forEach(({ row, i }) => {
        if (!row.amount.trim()) setError(`rows.${i}.amount`,     { message: 'Required' })
        if (!row.accountId)     setError(`rows.${i}.accountId`,  { message: 'Required' })
        if (!row.categoryId)    setError(`rows.${i}.categoryId`, { message: 'Required' })
      })
      toast.error('Some rows are incomplete. Fix them or leave fully empty to skip.')
      return
    }

    if (valids.length === 0) {
      toast.error('No expenses to add. Fill in at least one row.')
      return
    }

    setIsSubmitting(true)
    const dateStr = data.date ? format(data.date, 'yyyy-MM-dd') : undefined

    try {
      const results = await Promise.all(
        valids.map(({ row }) =>
          addExpenseAction({
            amount:     Number(row.amount.replace(/,/g, '')),
            accountId:  row.accountId,
            categoryId: row.categoryId,
            note:       row.note || 'Expense',
            date:       dateStr,
          })
        )
      )

      const failed = results.filter(r => !r.success)

      if (failed.length > 0) {
        toast.error(`${failed.length} expense(s) failed to save. Please try again.`)
      } else {
        toast.success(`${valids.length} expense${valids.length > 1 ? 's' : ''} added successfully.`)
      }

      if (blanks.length > 0) {
        toast.info(`${blanks.length} empty row${blanks.length > 1 ? 's were' : ' was'} skipped.`)
      }

      queryClient.invalidateQueries({ queryKey: ['wallets'] })
      queryClient.invalidateQueries({ queryKey: ['transactions'] })
      queryClient.invalidateQueries({ queryKey: ['expense_categories'] })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">

      {/* Shared date */}
      <div className="flex items-center justify-between gap-3">
        <span className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground whitespace-nowrap shrink-0">
          Date for all
        </span>
        <Controller
          control={control}
          name="date"
          render={({ field }) => (
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  className={cn(
                    'justify-start text-left font-normal border-border/50 h-8 text-sm',
                    !field.value && 'text-muted-foreground'
                  )}
                >
                  <CalendarIcon className="mr-2 h-3.5 w-3.5" />
                  {field.value ? format(field.value, 'PPP') : 'Today'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar mode="single" selected={field.value} onSelect={field.onChange} />
              </PopoverContent>
            </Popover>
          )}
        />
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-md border border-border/50">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              <th className="text-left font-mono text-[11px] uppercase tracking-wider text-muted-foreground px-3 py-2 w-32">Amount</th>
              <th className="text-left font-mono text-[11px] uppercase tracking-wider text-muted-foreground px-3 py-2">Account</th>
              <th className="text-left font-mono text-[11px] uppercase tracking-wider text-muted-foreground px-3 py-2">Category</th>
              <th className="text-left font-mono text-[11px] uppercase tracking-wider text-muted-foreground px-3 py-2">Note</th>
              <th className="w-8" />
            </tr>
          </thead>
          <tbody>
            {fields.map((field, i) => {
              const rowErrors = errors.rows?.[i]
              return (
                <tr key={field.id} className="group border-b border-border/50 last:border-0">
                  {/* Amount */}
                  <td className="px-3 py-2">
                    <Controller
                      control={control}
                      name={`rows.${i}.amount`}
                      render={({ field: f }) => (
                        <div className="flex flex-col gap-0.5">
                          <Input
                            type="text"
                            inputMode="decimal"
                            placeholder="0.00"
                            className={cn('h-8 w-28 text-right font-mono tabular-nums', rowErrors?.amount && 'border-destructive focus-visible:ring-destructive/20')}
                            {...f}
                            value={f.value ? formatInputAmount(String(f.value)) : ''}
                            onChange={(e) => {
                              clearErrors(`rows.${i}.amount`)
                              const raw = e.target.value.replace(/,/g, '').replace(/[^0-9.]/g, '')
                              const parts = raw.split('.')
                              f.onChange(parts.length > 2 ? parts[0] + '.' + parts.slice(1).join('') : raw)
                            }}
                          />
                          {rowErrors?.amount && (
                            <span className="text-[10px] text-destructive">{rowErrors.amount.message}</span>
                          )}
                        </div>
                      )}
                    />
                  </td>

                  {/* Account */}
                  <td className="px-3 py-2">
                    <Controller
                      control={control}
                      name={`rows.${i}.accountId`}
                      render={({ field: f }) => (
                        <div className="flex flex-col gap-0.5">
                          <Select
                            value={f.value}
                            onValueChange={(val) => {
                              clearErrors(`rows.${i}.accountId`)
                              if (val === 'add_wallet') setIsAddWalletOpen(true)
                              else f.onChange(val)
                            }}
                          >
                            <SelectTrigger className={cn('h-8 min-w-36', rowErrors?.accountId && 'border-destructive')}>
                              <SelectValue placeholder="Account" />
                            </SelectTrigger>
                            <SelectContent className="max-h-56">
                              <SelectGroup>
                                {isWalletsPending ? (
                                  <SelectItem disabled value="loading">Loading...</SelectItem>
                                ) : wallets.length === 0 ? (
                                  <SelectItem value="empty" disabled>No wallets</SelectItem>
                                ) : (
                                  wallets.map(w => (
                                    <SelectItem key={w.id} value={w.id}>
                                      {w.name} &bull; {w.type}
                                    </SelectItem>
                                  ))
                                )}
                                <div className="h-px bg-border my-1 mx-2" />
                                <SelectItem value="add_wallet" className="font-medium text-primary">+ Add Wallet</SelectItem>
                              </SelectGroup>
                            </SelectContent>
                          </Select>
                          {rowErrors?.accountId && (
                            <span className="text-[10px] text-destructive">{rowErrors.accountId.message}</span>
                          )}
                        </div>
                      )}
                    />
                  </td>

                  {/* Category */}
                  <td className="px-3 py-2">
                    <Controller
                      control={control}
                      name={`rows.${i}.categoryId`}
                      render={({ field: f }) => (
                        <div className="flex flex-col gap-0.5">
                          <Select
                            value={f.value}
                            onValueChange={(val) => {
                              clearErrors(`rows.${i}.categoryId`)
                              if (val === 'add_category') setIsAddCategoryOpen(true)
                              else f.onChange(val)
                            }}
                          >
                            <SelectTrigger className={cn('h-8 min-w-36', rowErrors?.categoryId && 'border-destructive')}>
                              <SelectValue placeholder="Category" />
                            </SelectTrigger>
                            <SelectContent className="max-h-56">
                              <SelectGroup>
                                {isCategoriesPending ? (
                                  <SelectItem disabled value="loading">Loading...</SelectItem>
                                ) : categories.length === 0 ? (
                                  <SelectItem value="empty" disabled>No categories</SelectItem>
                                ) : (
                                  categories.map(c => (
                                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                                  ))
                                )}
                                <div className="h-px bg-border my-1 mx-2" />
                                <SelectItem value="add_category" className="font-medium text-primary">+ Add Category</SelectItem>
                              </SelectGroup>
                            </SelectContent>
                          </Select>
                          {rowErrors?.categoryId && (
                            <span className="text-[10px] text-destructive">{rowErrors.categoryId.message}</span>
                          )}
                        </div>
                      )}
                    />
                  </td>

                  {/* Note */}
                  <td className="px-3 py-2">
                    <Controller
                      control={control}
                      name={`rows.${i}.note`}
                      render={({ field: f }) => (
                        <Input
                          type="text"
                          placeholder="What was this for?"
                          className="h-8 min-w-36"
                          {...f}
                          value={f.value ?? ''}
                        />
                      )}
                    />
                  </td>

                  {/* Remove button */}
                  <td className="pr-2">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-7 w-7 p-0 opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive"
                      disabled={fields.length === 1}
                      onClick={() => remove(i)}
                    >
                      <X className="h-3.5 w-3.5" />
                    </Button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Add row */}
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="self-end font-mono text-[11px] uppercase tracking-wider text-muted-foreground hover:text-foreground gap-1.5 px-3 bg-muted/20 hover:bg-muted/40 rounded-md"
        onClick={() => append(EMPTY_ROW)}
      >
        <Plus className="h-3 w-3" />
        Add row
      </Button>

      {/* Submit */}
      <Button
        type="submit"
        size="lg"
        className="w-full"
        disabled={validCount === 0 || isSubmitting}
      >
        {isSubmitting ? (
          <span className="inline-flex items-center gap-2">Adding <Spinner /></span>
        ) : (
          validCount > 0
            ? `Add ${validCount} Expense${validCount > 1 ? 's' : ''}`
            : 'Add Expenses'
        )}
      </Button>

      <AddCategoryModal isControlled open={isAddCategoryOpen} onOpenChange={setIsAddCategoryOpen} />
      <AddWalletModal   isControlled open={isAddWalletOpen}   onOpenChange={setIsAddWalletOpen} />
    </form>
  )
}
