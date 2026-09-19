import { MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { DeleteTransactionItem } from '@/components/Modals/Transactions/DeleteTransactionItem';
import { TransactionHistory } from '@/types/expenses';

interface TransactionActionsMenuProps {
  transaction: TransactionHistory;
}

export function TransactionActionsMenu({ transaction }: TransactionActionsMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground">
          <span className="sr-only">Open menu</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className='w-full'>
        <DeleteTransactionItem transaction={transaction} />
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
