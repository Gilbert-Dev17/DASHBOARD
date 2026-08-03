import { ChartPieDonutText } from '@/components/Shared/CategoryCharts'
import { AddCategoryModal } from '../Modals/AddCategory/AddCategoryModal'
import { TransactionHistory, CategorySummary } from '@/types/expenses'
import { ExpenseCategory } from '@/types/database'
import { formatCurrency } from '@/utils/currency'
import { CategoryBadge } from '@/components/Shared/CategoryBadge'
import { ArrowRight } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { AVAILABLE_ICONS } from '@/lib/constants/categories'
import { HelpCircle } from 'lucide-react'
import { Button } from '../ui/button'
import Link from 'next/link'
import { Badge } from '../ui/badge'
import { Tags } from 'lucide-react'
import { Empty, EmptyContent, EmptyMedia, EmptyTitle, EmptyDescription } from '@/components/ui/empty'

interface CategorySectionProps {
  transactions: TransactionHistory[];
  allCategories?: ExpenseCategory[];
  currency?: string;
}

export const CategorySection = ({ transactions, allCategories = [], currency = 'PHP' }: CategorySectionProps) => {

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

  return (
      <Card className="bg-card/3 gap-0"  aria-labelledby="categories-heading">
        <CardHeader className="flex justify-between items-center shrink-0">
          <CardTitle id="categories-heading" className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Categories</CardTitle>
          {allCategories.length > 0 && <AddCategoryModal />}
        </CardHeader>
        <CardContent className={`${allCategories.length > 0 ? 'grid grid-cols-1 xl:grid-cols-2 items-center min-h-75 py-0' : 'flex flex-col items-center justify-center text-center'}`}>

          <div className={allCategories.length > 0 ? 'flex justify-center items-center w-full' : 'flex flex-col items-center justify-center text-center w-full'}>
            {chartCategories.length > 0 ? (
              <div aria-hidden="true" className="w-full max-w-sm">
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
              <Empty className="py-8">
                <EmptyContent>
                  <EmptyMedia variant="icon">
                    <Tags className="h-6 w-6" aria-hidden="true" />
                  </EmptyMedia>
                  <EmptyTitle>
                    {allCategories.length > 0 ? "No expenses yet" : "No categories yet"}
                  </EmptyTitle>
                  <EmptyDescription className="mb-4">
                    {allCategories.length > 0
                      ? "Start logging expenses to see your breakdown."
                      : "Create a category to start tracking where your money goes."}
                  </EmptyDescription>
                  {allCategories.length === 0 && <AddCategoryModal />}
                </EmptyContent>
              </Empty>
            )}
          </div>


          {allCategories.length > 0 && (
            <div className="flex flex-col gap-10">

              {chartCategories.length > 0 && (
                <div className="flex flex-col gap-2">
                  <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                    Total
                  </span>
                  <div className="text-3xl lg:text-4xl font-mono text-foreground tracking-tighter flex items-baseline gap-1">
                    {formatCurrency(totalExpenses, currency).split('.')[0]}
                    <span className="text-lg lg:text-xl text-muted-foreground font-medium">.{formatCurrency(totalExpenses, currency).split('.')[1]}</span>
                  </div>
                </div>
              )}


              <div className="flex flex-col gap-4">
                <h3 className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                  Available Categories
                </h3>
                <div className="flex flex-wrap gap-2">
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
                          <Badge className="inline-flex items-center rounded-full bg-muted/30 px-3 py-1.5 text-xs font-medium shadow-sm border border-dashed border-border text-muted-foreground">
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
        </CardContent>
        {allCategories.length > 0 &&
          <div className='flex flex-row justify-end px-6'>
            <Button asChild variant={'link'} className="group px-0 text-muted-foreground hover:text-foreground flex items-center gap-1">
              <Link href='/finance/viewAllCategories'>
                View All<ArrowRight size={16} className="transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
            </Button>
          </div>
        }
      </Card>
  )
}
