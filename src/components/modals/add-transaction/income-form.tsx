'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { FieldGroup } from '@/components/ui/field'
import { Button } from '@/components/ui/button'

import { incomeSchema, type IncomeFormValues } from './schemas'
import { AmountField, NoteField } from './transaction-fields'

interface IncomeFormProps {
  onSuccess?: (values: IncomeFormValues) => void
}

export function IncomeForm({ onSuccess }: IncomeFormProps) {
  const form = useForm<IncomeFormValues>({
    resolver     : zodResolver(incomeSchema as any),
    defaultValues: { currency: 'peso', amount: '', note: '' },
  })

  function onSubmit(values: IncomeFormValues) {
    // TODO: Supabase insert
    onSuccess?.(values)
    form.reset()
  }

  return (
    <form
      onSubmit={form.handleSubmit(onSubmit)}
      className="flex flex-col gap-4"
      noValidate
      aria-label="Add income"
    >
      <FieldGroup>
        <AmountField
          control={form.control}
          nameCurrency="currency"
          nameAmount="amount"
        />

        <NoteField control={form.control} name="note" />

        {/* Add income-specific fields here (e.g. source) without touching ExpenseForm */}
      </FieldGroup>

      <Button type="submit" className="w-full">
        Add Income
      </Button>
    </form>
  )
}