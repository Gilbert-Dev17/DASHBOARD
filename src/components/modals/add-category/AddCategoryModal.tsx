'use client'

import { Plus } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from '@/components/ui/dialog'
import { FieldError, FieldGroup, FieldLabel, Field } from "@/components/ui/field"
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { AVAILABLE_ICONS, AVAILABLE_COLORS } from '@/lib/constants/categories'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { addCategoryAction } from '@/lib/actions/transactions'

const categorySchema = z.object({
  name: z.string().min(1, 'Category name is required'),
  icon: z.string().min(1, 'Please select an icon'),
  color: z.string().min(1, 'Please select a color'),
})

type CategoryFormValues = z.infer<typeof categorySchema>

export const AddCategoryModal = () => {
  const [isOpen, setIsOpen] = useState(false)
  const queryClient = useQueryClient()

  const { register, handleSubmit, watch, control, reset, formState: { errors } } = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema as any),
    defaultValues: {
      name: '',
      icon: AVAILABLE_ICONS[0].name,
      color: AVAILABLE_COLORS[0],
    }
  })

  const currentName = watch('name')
  const currentIconName = watch('icon')
  const currentColor = watch('color')
  const selectedIconObj = AVAILABLE_ICONS.find(i => i.name === currentIconName) || AVAILABLE_ICONS[0]

  const { mutate: addCategory, isPending } = useMutation({
    mutationFn: addCategoryAction,
    onSuccess: (result) => {
      if (!result.success) {
        toast.error(result.error || 'Failed to add category')
        return
      }
      toast.success('Category created successfully!')
      reset()
      queryClient.invalidateQueries({ queryKey: ['categories'] })
      setIsOpen(false)
    },
    onError: () => {
      toast.error('An unexpected error occurred')
    }
  })

  const onSubmit = (data: CategoryFormValues) => {
    addCategory({
      name: data.name,
      icon: data.icon,
      color: data.color,
    })
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm">
          <Plus size={12}/>
          Add Category
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogHeader>
            <DialogTitle className="font-bold">
              Add Category
            </DialogTitle>
            <DialogDescription>
              Create a new category to organize your transactions.
            </DialogDescription>
          </DialogHeader>

          {/* Live Preview Card */}
          <div className="mt-2 flex items-center gap-4 p-4 rounded-xl border border-border/50 bg-secondary/20 backdrop-blur-sm shadow-sm transition-all duration-300">
            <div
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full shadow-inner transition-colors duration-500"
              style={{ backgroundColor: `${currentColor}20`, color: currentColor }}
            >
              <selectedIconObj.icon size={24} />
            </div>
            <div className="flex flex-col overflow-hidden">
              <h3 className="font-semibold text-lg truncate">
                {currentName.trim() || 'Category Name'}
              </h3>
              <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">Live Preview</p>
            </div>
          </div>

        <FieldGroup className="mt-2 space-y-6">
          <Field>
            <FieldLabel
              htmlFor="category-name"
              className="mb-2 block text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground"
            >
              CATEGORY NAME
            </FieldLabel>
            <Controller
              control={control}
              name="name"
              render={({field}) => (
                <Input
                  type='text'
                  id="category-name"
                  placeholder="e.g., Groceries, Rent, Subscriptions..."
                  {...field}
                  className="h-12 bg-background/50 border-border/50 focus:bg-background transition-colors"
                />
              )}
            >
            </Controller>
            {errors.name && <FieldError>{errors.name.message}</FieldError>}
          </Field>

          <Field>
            <FieldLabel className="mb-3 block text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
              Select Icon
            </FieldLabel>
            <Controller
              control={control}
              name="icon"
              render={({ field }) => (
                <div className="grid grid-cols-6 gap-3 max-h-48 overflow-y-auto p-1 pr-2 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-border">
                  {AVAILABLE_ICONS.map((iconObj) => (
                    <Button
                      key={iconObj.name}
                      variant='outline'
                      size='icon'
                      type="button"
                      onClick={() => field.onChange(iconObj.name)}
                      className={`flex h-10 w-10 items-center justify-center rounded-xl border transition-all duration-300 hover:scale-105 hover:bg-secondary ${
                        field.value === iconObj.name
                          ? 'scale-110 border-foreground shadow-sm bg-secondary'
                          : 'border-transparent bg-transparent text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      <iconObj.icon size={18} strokeWidth={field.value === iconObj.name ? 2.5 : 2}/>
                    </Button>
                  ))}
                </div>
              )}
            />
            {errors.icon && <FieldError>{errors.icon.message}</FieldError>}
          </Field>

          <Field>
            <FieldLabel className="mb-3 block text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
              Select Color
            </FieldLabel>
            {/* Tight Color Grid */}
            <Controller
              control={control}
              name="color"
              render={({ field }) => (
                <div className="flex flex-wrap gap-2.5">
                  {AVAILABLE_COLORS.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => field.onChange(color)}
                      className="h-6 w-6 rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                      style={{
                        backgroundColor: color,
                        transform: field.value === color ? 'scale(1.3)' : 'scale(1)',
                        boxShadow: field.value === color ? `0 0 12px ${color}80` : 'none',
                        border: field.value === color ? '2px solid white' : '2px solid transparent',
                      }}
                      aria-label={`Select color ${color}`}
                    />
                  ))}
                </div>
              )}
            />
            {errors.color && <FieldError>{errors.color.message}</FieldError>}
          </Field>
        </FieldGroup>

        <div className="mt-4 flex justify-end">
          <Button type="submit" size="lg" className="w-full font-semibold shadow-sm" disabled={isPending || !currentName.trim()}>
            {isPending ? 'Creating...' : 'Create Category'}
          </Button>
        </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}