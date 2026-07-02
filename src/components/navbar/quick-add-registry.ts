import { ComponentType } from 'react'
import { AddPlannerModal } from '@/components/modals/add-planner/AddPlannerModal'
import { AddIncomeExpenseModal } from '@/components/modals/add-transaction/add-income-expense-modal'

export interface QuickAddRegistry {
    id: string
    match: (pathname: string) => boolean
    Component: ComponentType<any>
}
// TODO: Populate Quick Add Registry with more components as needed

export const quickAddRegistry: QuickAddRegistry[] = [
  {
    id: 'planner',
    match: (pathname) => pathname.startsWith('/planner') || pathname.startsWith('/home'),
    Component: AddPlannerModal,
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