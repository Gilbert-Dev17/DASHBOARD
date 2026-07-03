'use client'

import { Control, Controller, FieldPath, FieldValues } from 'react-hook-form'

import { Input } from '@/components/ui/input'
import {
  Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import {
  Field, FieldError, FieldLabel, FieldLegend, FieldSet,
} from '@/components/ui/field'

import { CURRENCIES, CURRENCY_ICON_MAP } from './constants'

interface AmountFieldProps<T extends FieldValues> {
  control      : Control<T>
  nameCurrency : FieldPath<T>
  nameAmount   : FieldPath<T>
}

export function AmountField<T extends FieldValues>({
  control,
  nameCurrency,
  nameAmount,
}: AmountFieldProps<T>) {
  return (
    <FieldSet>
      <div className="flex flex-col gap-1">
        <FieldLabel
            className="text-[0.75em] font-bold tracking-widest text-muted-foreground"
          >
            AMOUNT
          </FieldLabel>
        <div className="flex items-center border-b-2" >
          <Controller
            control={control}
            name={nameCurrency}
            render={({ field, fieldState }) => {
              const Icon = CURRENCY_ICON_MAP[field.value as string] ?? CURRENCY_ICON_MAP.dollar
              return (
                <Field data-invalid={!!fieldState.error} className="w-14 shrink-0 border-none">
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger
                      className="h-14! text-xl! border-none focus-visible:ring-0 rounded-none bg-transparent"
                      hideChevron
                      aria-label="Select currency"
                      aria-invalid={!!fieldState.error}
                    >
                      <SelectValue>
                        <span className="flex items-center gap-1.5">
                          <Icon size={18} aria-hidden />
                        </span>
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent >
                      <SelectGroup >
                        {CURRENCIES.map((c) => {
                          const CIcon = CURRENCY_ICON_MAP[c.iconKey]
                          return (
                            <SelectItem key={c.name} value={c.name} >
                              <span className="flex items-center gap-2">
                                <CIcon size={18} aria-hidden />
                                {c.label}
                              </span>
                            </SelectItem>
                          )
                        })}
                      </SelectGroup>
                    </SelectContent>
                  </Select>

                  <FieldError errors={[fieldState.error]} />
                </Field>
              )
            }}
          />

          <Controller
            control={control}
            name={nameAmount}
            render={({ field, fieldState }) => (
              <Field data-invalid={!!fieldState.error} className="flex-1">
                <Input
                  {...field}
                  type="number"
                  inputMode="decimal"
                  placeholder="0.00"
                  aria-label="Amount"
                  aria-invalid={!!fieldState.error}
                  min={0}
                  step="0.01"
                  className="w-full border-none h-14 text-2xl! md:text-2xl! focus-visible:ring-0 rounded-none bg-transparent "
                />
                <FieldError errors={[fieldState.error]} />
              </Field>
            )}
          />
        </div>
      </div>
    </FieldSet>
  )
}

interface NoteFieldProps<T extends FieldValues> {
  control : Control<T>
  name    : FieldPath<T>
}

export function NoteField<T extends FieldValues>({ control, name }: NoteFieldProps<T>) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <Field data-invalid={!!fieldState.error}>
          <FieldLabel
            htmlFor={`field-${name}`}
            className="text-[0.75em] font-bold tracking-widest text-muted-foreground"
          >
            NOTE
          </FieldLabel>
          <Input
            {...field}
            id={`field-${name}`}
            placeholder="What was this for?"
            aria-invalid={!!fieldState.error}
          />
          <FieldError errors={[fieldState.error]} />
        </Field>
      )}
    />
  )
}