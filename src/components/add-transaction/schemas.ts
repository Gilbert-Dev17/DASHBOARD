import { z } from 'zod'
import { CURRENCY_KEYS, CATEGORY_KEYS } from './constants'

const amountSchema = z
  .string()
  .min(1, 'Amount is required')
  .refine(
    (v) => !isNaN(Number(v)) && Number(v) > 0,
    'Must be a positive number',
  )
  .refine(
    (v) => /^\d+(\.\d{0,2})?$/.test(v),
    'Max 2 decimal places',
  )

const baseSchema = z.object({
  currency : z.enum(CURRENCY_KEYS, { message: 'Select a currency' }),
  amount   : amountSchema,
  note     : z.string().trim().optional(),
})

// ── Expense ────────────────────────────────────────────────────────────────────
export const expenseSchema = baseSchema.extend({
  category : z.enum(CATEGORY_KEYS, { message: 'Select a category' })
})

// ── Income ─────────────────────────────────────────────────────────────────────
export const incomeSchema = baseSchema.extend({})

export type CurrencyKey       = (typeof CURRENCY_KEYS)[number]
export type CategoryKey        = (typeof CATEGORY_KEYS)[number]
export type ExpenseFormValues = z.infer<typeof expenseSchema>
export type IncomeFormValues  = z.infer<typeof incomeSchema>