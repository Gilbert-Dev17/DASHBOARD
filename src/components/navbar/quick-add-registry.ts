import { ComponentType } from 'react'
import { QuickAddModal } from '../modals/quick-addModal/QuickAddModal'
import { AddIncomeExpenseModal } from '@/components/modals/add-transaction/add-income-expense-modal'

export interface QuickAddRegistry {
    id: string
    match: (pathname: string) => boolean
    Component: ComponentType<any>
}

export const quickAddRegistry: QuickAddRegistry[] = [
  {
    id: 'home',
    match: (pathname) => pathname.startsWith('/home') || pathname.startsWith('/planner') ,
    Component: QuickAddModal,
  },
  {
    id: 'expenses',
    match: (pathname) => pathname.startsWith('/expenses'),
    Component: AddIncomeExpenseModal,
  },
];

export function getActiveQuickAdds(pathname: string): QuickAddRegistry[] {
    return quickAddRegistry.filter((entry) => entry.match(pathname))
};