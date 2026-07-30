'use client'

import React from 'react'
import { Trash2 } from 'lucide-react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogMedia,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { deleteWalletAction } from '@/lib/actions/transactions'
import { useRouter } from 'next/navigation'

interface DeleteWalletModalProps {
  walletId: string;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

export const DeleteWalletModal = ({ walletId, isOpen, setIsOpen }: DeleteWalletModalProps) => {
  const queryClient = useQueryClient()
  const router = useRouter()

  const { mutate: deleteWallet, isPending } = useMutation({
    mutationFn: () => deleteWalletAction(walletId),
    onMutate: () => {
      router.back()
      setIsOpen(false)
      toast.success('Wallet deleted successfully')
    },
    onSuccess: (result) => {
      if (!result.success) {
        toast.error(result.error || 'Failed to delete wallet')
        return
      }
      queryClient.invalidateQueries({ queryKey: ['wallets'] })
    },
    onError: () => {
      toast.error('An unexpected error occurred')
    }
  })

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogContent size='sm'>
        <AlertDialogHeader>
          <AlertDialogMedia className="bg-rose-500/10 text-rose-500">
            <Trash2 />
          </AlertDialogMedia>
          <AlertDialogTitle>Delete Account?</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete this account? This action cannot be undone and will permanently remove this account and all of its associated data from our servers.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
          <Button
            variant="destructive"
            onClick={() => deleteWallet()}
            disabled={isPending}
            className="bg-rose-500 hover:bg-rose-600 text-white"
          >
            {isPending ? 'Deleting...' : 'Delete Account'}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
