'use client'

import { Tag, HelpCircle } from 'lucide-react'
import PageComponent from '@/components/Shared/PageComponent'
import { PageHeader } from '@/components/Shared/PageHeader'
import { Card, CardContent } from '@/components/ui/card'
import { AVAILABLE_ICONS } from '@/lib/constants/categories'
import type { CategoryWithTotal } from '@/types/expenses'
import { formatCurrency } from '@/utils/currency'
import { useRouter } from 'next/navigation'

import { AddCategoryModal } from '@/components/Modals/AddCategory/AddCategoryModal'

interface ViewAllCategoriesClientProps {
  categories: CategoryWithTotal[]
}

export function ViewAllCategoriesClient({ categories }: ViewAllCategoriesClientProps) {
  const router = useRouter()

  return (
    <PageComponent>
        <PageHeader title="All Categories">
          <AddCategoryModal />
        </PageHeader>

        {categories.length === 0 ? (
          <div className="flex w-full flex-col items-center justify-center rounded-xl border border-dashed py-12 bg-card/30">
            <Tag className="mb-3 h-10 w-10 text-muted-foreground/50" aria-hidden="true" />
            <p className="mb-1 text-base font-medium text-foreground/80">No categories found</p>
            <p className="text-sm text-muted-foreground">You haven&apos;t created any custom categories yet.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-12">
            {Object.entries(
              categories.reduce((acc, cat) => {
                const currency = cat.currency || 'PHP';
                if (!acc[currency]) acc[currency] = [];
                acc[currency].push(cat);
                return acc;
              }, {} as Record<string, typeof categories>)
            ).map(([currency, currencyCategories]) => (
              <div key={currency} className="space-y-4">
                <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground border-b border-border/50 pb-2">
                  {currency} Categories
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                  {currencyCategories.map((cat) => {
                    const iconObj = cat.icon ? AVAILABLE_ICONS.find(i => i.name === cat.icon) : null;
                    const Icon = iconObj?.icon || HelpCircle;

                    return (
                      <Card key={cat.id} className="bg-card/30 hover:bg-card/60 transition-colors border-border/50 overflow-hidden">
                        <CardContent className="flex flex-row items-center gap-4">
                          <div className="shrink-0 p-3 rounded-full bg-background border border-border/50 shadow-sm">
                            <Icon size={20} style={{ color: cat.color || 'var(--muted)' }} />
                          </div>
                          <div className="flex flex-col gap-1 items-start min-w-0 w-full">
                            <span className="text-sm font-medium text-foreground/90 truncate w-full text-left">
                              {cat.name}
                            </span>
                            <span className="text-xs font-mono text-muted-foreground text-left">
                              {formatCurrency(cat.total_expense, cat.currency)}
                            </span>
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
    </PageComponent>
  )
}
