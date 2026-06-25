'use client'

import React, { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Field, FieldGroup } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import {
  Receipt,
  Target,
  CreditCard,
  Activity,
  Sun,
  Calendar,
  Home,
  Plus,
} from 'lucide-react'

const AVAILABLE_ICONS = [
  { name: 'Receipt', icon: Receipt },
  { name: 'Target', icon: Target },
  { name: 'CreditCard', icon: CreditCard },
  { name: 'Activity', icon: Activity },
  { name: 'Sun', icon: Sun },
  { name: 'Calendar', icon: Calendar },
  { name: 'Home', icon: Home },
]

const AVAILABLE_COLORS = [
  '#C5BFAE',
  '#C91111',
  '#39FF14',
  '#E36414',
  '#A3B18A',
  '#DDA15E',
  '#BC6C25',
  '#4A90E2',
  '#9B51E0',
]

export const AddCategoryModal = () => {
  const [selectedIcon, setSelectedIcon] = useState(AVAILABLE_ICONS[0])
  const [selectedColor, setSelectedColor] = useState(AVAILABLE_COLORS[0])

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm">
          <Plus className="mr-1 h-4 w-4" />
          Add Category
        </Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader className='py-2'>
          <DialogTitle>New Category</DialogTitle>
        </DialogHeader>

        <FieldGroup>
          <Field>
            <Label
            htmlFor="category-name"
            className='className="mb-4 block text-[11px] font-bold uppercase tracking-[0.2em] opacity-50'
            >
                CATEGORY NAME
                </Label>
            <Input
              id="category-name"
              name="name"
              placeholder="Enter category name"
            />
          </Field>

          <div>
            <Label className="mb-4 block text-[11px] font-bold uppercase tracking-[0.2em] opacity-50">
              Select Icon
            </Label>

            <div className="flex flex-wrap gap-3">
              {AVAILABLE_ICONS.map((iconObj) => (
                <Button
                  key={iconObj.name}
                    variant='outline'
                    size='sm'
                  onClick={() => setSelectedIcon(iconObj)}
                  className={`flex h-12 w-12 items-center justify-center rounded-full border transition-all duration-300 ${
                    selectedIcon.name === iconObj.name
                      ? 'scale-110 border-primary'
                      : 'border-transparent'
                  }`}
                >
                  <iconObj.icon size={20}/>
                </Button>
              ))}
            </div>
          </div>

          <div>
            <Label className="mb-4 block text-[11px] font-bold uppercase tracking-[0.2em] opacity-50">
              Select Color
            </Label>

            <div className="flex flex-wrap gap-3">
              {AVAILABLE_COLORS.map((color) => (
                <Button
                  key={color}
                //   type="button"
                  onClick={() => setSelectedColor(color)}
                  className="h-8 w-8 rounded-full transition-all duration-300"
                  style={{
                    backgroundColor: color,
                    border:
                      selectedColor === color
                        ? '2px solid currentColor'
                        : 'none',
                    transform:
                      selectedColor === color
                        ? 'scale(1.2)'
                        : 'scale(1)',
                    boxShadow:
                      selectedColor === color
                        ? `0 0 10px ${color}`
                        : 'none',
                  }}
                />
              ))}
            </div>
          </div>
        </FieldGroup>

        <Button variant="outline">Create Category</Button>
      </DialogContent>
    </Dialog>
  )
}