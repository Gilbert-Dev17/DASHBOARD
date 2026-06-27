'use client'

import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { HelpCircle } from 'lucide-react'
import {
  Field, FieldError, FieldGroup, FieldLabel,
} from '@/components/ui/field'
import {
  Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'

import { expenseSchema, type ExpenseFormValues } from './schemas'
import { CATEGORIES, ICON_MAP } from './constants'
import { AmountField, NoteField } from './transaction-fields'

interface ExpenseFormProps {
  onSuccess?: (values: ExpenseFormValues) => void
}

export function ExpenseForm({ onSuccess }: ExpenseFormProps) {
  const form = useForm<ExpenseFormValues>({
    resolver     : zodResolver(expenseSchema),
    defaultValues: { currency: 'peso', amount: '', note: '', category: undefined },
  })

  function onSubmit(values: ExpenseFormValues) {
    // TODO: Supabase insert
    onSuccess?.(values)
    form.reset()
  }

  return (
    <form
      onSubmit={form.handleSubmit(onSubmit)}
      className="flex flex-col gap-4"
      noValidate
      aria-label="Add expense"
    >
      <FieldGroup>

        <AmountField
          control={form.control}
          nameCurrency="currency"
          nameAmount="amount"
        />

        <NoteField control={form.control} name="note" />

        <Controller
          control={form.control}
          name="category"
          render={({ field, fieldState }) => (
            <Field data-invalid={!!fieldState.error}>
              <FieldLabel>CATEGORY</FieldLabel>
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger
                  className="w-full"
                  aria-label="Select category"
                  aria-invalid={!!fieldState.error}
                >
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {CATEGORIES.map((cat) => {
                      const Icon = ICON_MAP[cat.iconKey] ?? HelpCircle
                      return (
                        <SelectItem key={cat.iconKey} value={cat.iconKey}>
                          <span className="flex items-center gap-2">
                            <Icon size={14} aria-hidden />
                            {cat.name}
                          </span>
                        </SelectItem>
                      )
                    })}
                  </SelectGroup>
                </SelectContent>
              </Select>
              <FieldError errors={[fieldState.error]} />
            </Field>
          )}
        />

      </FieldGroup>

      <Button type="submit" className="w-full">
        Add Expense
      </Button>
    </form>
  )
}