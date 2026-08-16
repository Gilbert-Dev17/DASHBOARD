'use client'

import { Trash2, Undo2 } from 'lucide-react'
import { DropdownMenuItem } from '@/components/ui/dropdown-menu'
import { toast } from 'sonner'
import { DeleteTransaction } from '@/lib/actions/transactions'
import { UndoCountdown } from '@/components/Modals/PlannerModals/task-deleteModal/UndoDeleteToast'
import { TransactionHistory } from '@/types/expenses'

const UNDO_DURATION = 5000

interface DeleteTransactionItemProps {
  transaction: TransactionHistory
  onDeleted?: () => void
}

export const DeleteTransactionItem = ({ transaction, onDeleted }: DeleteTransactionItemProps) => {

  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault()
    onDeleted?.()

    // 1. Dispatch custom event for optimistic UI removal
    window.dispatchEvent(new CustomEvent('optimistic-transaction-delete', {
      detail: { transactionId: transaction.id, transaction }
    }))

    // 2. Set timeout for actual API deletion
    let cancelled = false
    const timer = setTimeout(async () => {
      if (cancelled) return
      const result = await DeleteTransaction(transaction.id)
      if (!result.success) {
        toast.error('Failed to delete: ' + result.message)
        // Revert optimistic delete if API fails
        window.dispatchEvent(new CustomEvent('optimistic-transaction-restore', {
          detail: { transaction }
        }))
      }
    }, UNDO_DURATION)

    // 3. Show the undo toast
    const note = transaction.note || transaction.type
    toast(`"${note}" deleted`, {
      icon: <Trash2 size={16} className="text-destructive" />,
      description: <UndoCountdown />,
      duration: UNDO_DURATION + 200,
      action: {
        label: <span className='flex items-center gap-1.5 font-semibold text-xs tracking-wider uppercase'>Undo <Undo2 size={14} /></span>,
        onClick: () => {
          cancelled = true
          clearTimeout(timer)
          window.dispatchEvent(new CustomEvent('optimistic-transaction-restore', {
            detail: { transaction }
          }))
        },
      },
    })
  }

  return (
    <DropdownMenuItem onClick={handleDelete} className="text-rose-500 focus:text-rose-500 cursor-pointer w-full">
      <Trash2 className="mr-2 h-4 w-4" />
      Delete Transaction
    </DropdownMenuItem>
  )
}
