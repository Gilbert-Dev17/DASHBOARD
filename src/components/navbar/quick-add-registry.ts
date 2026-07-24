import { ComponentType } from 'react'
import { QuickAddModal } from '../Modals/PlannerModals/quick-addModal/QuickAddModal'
import { AddTransactionModal } from '@/components/Modals/AddTransaction/AddTransactionModal'

export interface QuickAddRegistry {
    id: string
    match: (pathname: string) => boolean
    Component: ComponentType<any>
}

export const quickAddRegistry: QuickAddRegistry[] = [
  {
    id: 'plan',
    match: (pathname) => pathname.startsWith('/home') || pathname.startsWith('/schedule') ,
    Component: QuickAddModal,
  },
  {
    id: 'expenses',
    match: (pathname) => pathname.startsWith('/finance'),
    Component: AddTransactionModal,
  },
];

export function getActiveQuickAdds(pathname: string): QuickAddRegistry[] {
    return quickAddRegistry.filter((entry) => entry.match(pathname))
};