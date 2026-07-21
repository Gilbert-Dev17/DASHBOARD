'use client'

import Link from 'next/link'
import { ArrowLeft, Tag, HelpCircle } from 'lucide-react'
import PageComponent from '@/components/shared/PageComponent'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { AVAILABLE_ICONS } from '@/lib/constants/categories'
import type { CategoryWithTotal } from '@/types/expenses'
import { formatCurrency } from '@/utils/currency'

interface ViewAllCategoriesClientProps {
  categories: CategoryWithTotal[]
}

export function ViewAllCategoriesClient({ categories }: ViewAllCategoriesClientProps) {
  return (
    <PageComponent>
      <section className='mt-5'>
        {/* HEADER */}
        <header className="flex flex-col md:flex-row md:items-end justify-between items-start gap-6 mb-12">
          <div className="flex flex-col gap-2">
            <Link href="/finance" className="mb-2">
              <Button variant="ghost" size="sm" className="h-8 px-2 text-muted-foreground hover:text-foreground">
                <ArrowLeft size={14} className="mr-2" />
                Back to Finance
              </Button>
            </Link>
            <h1 className="text-3xl font-light tracking-tight">
              All Categories
            </h1>
          </div>
        </header>

        {/* CONTENT */}
        {categories.length === 0 ? (
          <div className="flex w-full flex-col items-center justify-center rounded-xl border border-dashed py-24 bg-card/30">
            <Tag className="mb-3 h-10 w-10 text-muted-foreground/50" aria-hidden="true" />
            <p className="mb-1 text-base font-medium text-foreground/80">No categories found</p>
            <p className="text-sm text-muted-foreground">You haven't created any custom categories yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {categories.map((cat) => {
              const iconObj = cat.icon ? AVAILABLE_ICONS.find(i => i.name === cat.icon) : null;
              const Icon = iconObj?.icon || HelpCircle;

              return (
                <Card key={cat.id} className="bg-card/30 hover:bg-card/60 transition-colors border-border/50 overflow-hidden">
                  <CardContent className="p-6 flex flex-col items-center justify-center text-center gap-3">
                    <div className="p-3 rounded-full bg-background border border-border/50 shadow-sm">
                      <Icon size={20} style={{ color: cat.color || 'var(--muted)' }} />
                    </div>
                    <div className="flex flex-col gap-1 w-full">
                      <span className="text-sm font-medium text-foreground/90 truncate w-full">
                        {cat.name}
                      </span>
                      <span className="text-xs font-mono text-muted-foreground">
                        {formatCurrency(cat.total_expense || 0, cat.currency)}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </section>
    </PageComponent>
  )
}
