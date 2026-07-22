import { z } from 'zod'

const amountField = z.coerce.number({}).min(0.01, 'Amount must be greater than 0')
const accountField = z.string().min(1, 'Please select an account')
const noteField = z.string().optional()


export const expenseSchema = z.object({
  amount: amountField,
  accountId: accountField,
  categoryId: z.string().min(1, 'Please select a category'),
  note: noteField,
})

export type ExpenseFormValues = z.infer<typeof expenseSchema>


export const incomeSchema = z.object({
  amount: amountField,
  accountId: accountField,
  source: z.string().default('Income'),
  note: noteField,
})

export type IncomeFormValues = z.infer<typeof incomeSchema>


export const transferSchema = z.object({
  amount: amountField,
  fromAccountId: z.string().min(1, 'Please select the source'),
  toAccountId: z.string().min(1, 'Please select the destination'),
  transferFee: z.coerce.number().min(0).optional(),
  note: noteField,
}).refine((data) => data.fromAccountId !== data.toAccountId, {
  message: 'Source and destination must be different accounts',
  path: ['toAccountId'],
})

export type TransferFormValues = z.infer<typeof transferSchema>
