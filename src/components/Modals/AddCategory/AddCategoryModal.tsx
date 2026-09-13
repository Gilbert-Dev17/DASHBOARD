'use client'

import { Plus } from 'lucide-react'
import { useState } from 'react'
import {
  ResponsiveDialog as Dialog,
  ResponsiveDialogContent as DialogContent,
  ResponsiveDialogHeader as DialogHeader,
  ResponsiveDialogTitle as DialogTitle,
  ResponsiveDialogTrigger as DialogTrigger,
  ResponsiveDialogDescription as DialogDescription,
} from '@/components/ui/responsive-dialog'
import { Button } from '@/components/ui/button'
import { AddCategoryForm } from './AddCategoryForm'

interface AddCategoryModalProps {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  isControlled?: boolean
}

export const AddCategoryModal = ({ open, onOpenChange, isControlled = false }: AddCategoryModalProps = {}) => {
  // Internal state for when it's used as a standalone button (e.g., Categories page)
  const [internalOpen, setInternalOpen] = useState(false)

  // Determine which state to use
  const isOpen = isControlled ? open : internalOpen
  const handleOpenChange = (newOpen: boolean) => {
    if (isControlled && onOpenChange) {
      onOpenChange(newOpen)
    } else {
      setInternalOpen(newOpen)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      {!isControlled && (
        <DialogTrigger asChild>
          <Button variant="ghost" size="sm">
            <Plus size={12} />
            Add Category
          </Button>
        </DialogTrigger>
      )}

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-base font-semibold">Add Category</DialogTitle>
          <DialogDescription>
            Create a new category to organize your transactions.
          </DialogDescription>
        </DialogHeader>

        <AddCategoryForm onSuccess={() => handleOpenChange(false)} />
      </DialogContent>
    </Dialog>
  )
}