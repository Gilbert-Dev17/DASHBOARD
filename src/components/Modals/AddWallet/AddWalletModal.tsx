'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
import {
  ResponsiveDialog as Dialog,
  ResponsiveDialogContent as DialogContent,
  ResponsiveDialogHeader as DialogHeader,
  ResponsiveDialogTitle as DialogTitle,
  ResponsiveDialogTrigger as DialogTrigger,
  ResponsiveDialogDescription as DialogDescription,
} from '@/components/ui/responsive-dialog'
import { Button } from '@/components/ui/button'
import { AddWalletForm } from './AddWalletForm'

interface AddWalletModalProps {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  isControlled?: boolean
}

export const AddWalletModal = ({ open, onOpenChange, isControlled = false }: AddWalletModalProps = {}) => {
  const [internalOpen, setInternalOpen] = useState(false)

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
          <Button variant="ghost" className="flex items-center gap-2">
            <Plus size={16} />
            Add Wallet
          </Button>
        </DialogTrigger>
      )}

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-base font-semibold">Add Wallet</DialogTitle>
          <DialogDescription>
            Create a new wallet to track your finances.
          </DialogDescription>
        </DialogHeader>

        <AddWalletForm
          isOpen={isOpen}
          onSuccess={() => handleOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  )
}
