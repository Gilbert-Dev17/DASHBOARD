import { ComponentType } from 'react'
import { QuickAddModal } from '../Modals/PlannerModals/quick-addModal/QuickAddModal'
import { AddTransactionModal } from '@/components/Modals/AddTransaction/AddTransactionModal'

export interface QuickAddRegistry {
    id: string
    label: string
    match: (pathname: string) => boolean
    Component: ComponentType<{ enableShortcut?: boolean }>
}

export const quickAddRegistry: QuickAddRegistry[] = [
  {
    id: 'plan',
    label: 'Quick Add',
    match: (pathname) => pathname.startsWith('/home') || pathname.startsWith('/schedule') ,
    Component: QuickAddModal,
  },
  {
    id: 'expenses',
    label: 'Add Transaction',
    match: (pathname) => pathname.startsWith('/finance'),
    Component: AddTransactionModal,
  },
];

export function getActiveQuickAdds(pathname: string): QuickAddRegistry[] {
    return quickAddRegistry.filter((entry) => entry.match(pathname))
};