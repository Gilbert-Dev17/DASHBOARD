'use client'

import { ChartPieDonutText } from '@/components/Shared/CategoryCharts'
import { AddCategoryModal } from '../Modals/AddCategory/AddCategoryModal'
import { TransactionHistory, CategorySummary } from '@/types/expenses'
import { ExpenseCategory } from '@/types/database'
import { formatCurrency } from '@/utils/currency'
import { CategoryBadge } from '@/components/Shared/CategoryBadge'
import { MoreHorizontal, Plus, ArrowRight } from 'lucide-react'
import { Button } from '../ui/button'
import Link from 'next/link'
import { Badge } from '../ui/badge'
import { Tags } from 'lucide-react'
import { Empty, EmptyContent, EmptyMedia, EmptyTitle, EmptyDescription } from '@/components/ui/empty'
import { Separator } from '@/components/ui/separator'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { useState } from 'react'

interface CategorySectionProps {
  transactions: TransactionHistory[];
  allCategories?: ExpenseCategory[];
  currency?: string;
}

export const CategorySection = ({ transactions, allCategories = [], currency = 'PHP' }: CategorySectionProps) => {
  const [showAddModal, setShowAddModal] = useState(false)

  const categoryMap = new Map<string, CategorySummary>();

  allCategories.forEach(cat => {
    categoryMap.set(cat.id, { name: cat.name, icon: cat.icon, color: cat.color, total: 0 });
  });

  (transactions || []).forEach(txn => {
    if (txn.type === 'expense') {
      const key = txn.category_id ?? 'uncategorized';
      const existing = categoryMap.get(key) || {
        name: txn.expense_categories?.name || 'Uncategorized',
        icon: txn.expense_categories?.icon || 'foods-drinks',
        color: txn.expense_categories?.color || undefined,
        total: 0
      };
      existing.total = (existing.total || 0) + Number(txn.amount);
      categoryMap.set(key, existing);
    }
  });

  const categories = Array.from(categoryMap.values()).sort((a, b) => (b.total || 0) - (a.total || 0));
  const chartCategories = categories.filter(c => (c.total || 0) > 0);
  const totalExpenses = chartCategories.reduce((acc, cat) => acc + (cat.total || 0), 0);
  const stats = [
    { label: 'Total', value: chartCategories.length > 0 ? formatCurrency(totalExpenses, currency) : '—' },
    { label: 'Top', value: chartCategories.length > 0 ? chartCategories[0].name : '—' },
  ];

  return (
    <>
      <section className="border border-border rounded-md overflow-hidden shadow-vercel" aria-labelledby="categories-heading">
        {allCategories.length === 0 ? (
          <Empty className="py-8">
            <EmptyContent>
              <EmptyMedia variant="icon">
                <Tags className="h-6 w-6" aria-hidden="true" />
              </EmptyMedia>
              <EmptyTitle>No categories yet</EmptyTitle>
              <EmptyDescription className="mb-4">
                Create a category to start tracking where your money goes.
              </EmptyDescription>
              <AddCategoryModal />
            </EmptyContent>
          </Empty>
        ) : (
          <div className="flex items-stretch">
            <div className="flex items-center justify-center p-6 w-2/5 shrink-0">
              {chartCategories.length > 0 ? (
                <div aria-hidden="true" className="w-full max-w-60">
                  <ChartPieDonutText categories={chartCategories} currency={currency} />

                  <table className="sr-only">
                    <caption>Category Breakdown</caption>
                    <thead>
                      <tr>
                        <th scope="col">Category</th>
                        <th scope="col">Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {chartCategories.map((cat) => (
                        <tr key={cat.name}>
                          <td>{cat.name}</td>
                          <td>{formatCurrency(cat.total || 0, currency)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center text-center py-8">
                  <Tags className="h-6 w-6 text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">No expenses yet</p>
                </div>
              )}
            </div>

            {/* VERTICAL BORDER — partial height, centered */}
            <div className="flex items-center py-4">
              <Separator orientation="vertical" className="h-64" />
            </div>

            <div className="flex-1 flex flex-col min-w-0">
              <div className="px-5 py-4 flex items-center justify-between">
                <div>
                  <h2 id="categories-heading" className="text-base font-medium text-foreground">Categories</h2>

                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild>
                      <AddCategoryModal />
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/finance/viewAllCategories">
                        View All
                      </Link>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <Separator orientation="horizontal" className='size-20'/>

              {/* Stats rows (mapped) */}
              <section className="flex flex-col gap-2 py-3">
                {stats.map((s) => (
                  <div key={s.label} className="flex items-center justify-between px-5">
                    <span className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">{s.label}:</span>
                    <span className="text-sm font-semibold text-foreground">{s.value}</span>
                  </div>
                ))}
              </section>

              <Separator orientation="horizontal" />

              {/* Categories badges row */}
              <div className="px-5 py-3 flex flex-wrap gap-1.5">
                {(() => {
                  const sortedCategories = [...allCategories].sort((a, b) => {
                    const totalA = categoryMap.get(a.id)?.total || 0;
                    const totalB = categoryMap.get(b.id)?.total || 0;
                    return totalB - totalA;
                  });

                  const visibleCategories = sortedCategories.slice(0, 5);
                  const hiddenCount = sortedCategories.length - 5;

                  return (
                    <>
                      {visibleCategories.map(cat => (
                        <CategoryBadge
                          key={cat.id}
                          name={cat.name}
                          icon={cat.icon}
                          color={cat.color}
                        />
                      ))}

                      {hiddenCount > 0 && (
                        <Badge className="inline-flex items-center rounded-full bg-muted/30 px-3 py-1.5 text-xs font-medium border border-dashed border-border text-muted-foreground">
                          +{hiddenCount} more
                        </Badge>
                      )}
                    </>
                  )
                })()}
              </div>


            </div>
          </div>
        )}
      </section>
    </>
  )
}
