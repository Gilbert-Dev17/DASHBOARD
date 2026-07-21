import { ChartPieDonutText } from '@/components/shared/CategoryCharts'
import { AddCategoryModal } from '@/components/modals/add-category/AddCategoryModal'
import { TransactionHistory, CategorySummary } from '@/types/expenses'
import { ExpenseCategory } from '@/types/database'
import { formatCurrency } from '@/utils/currency'
import { Badge } from '@/components/ui/badge'
import { ArrowRight } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { AVAILABLE_ICONS } from '@/lib/constants/categories'
import { HelpCircle } from 'lucide-react'
import { Button } from '../ui/button'
import Link from 'next/link'

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
      <Card className="bg-card/30"  aria-labelledby="categories-heading">
        <CardHeader className="flex justify-between items-center shrink-0">
          <CardTitle id="categories-heading" className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Categories</CardTitle>
          <AddCategoryModal />
        </CardHeader>
        <CardContent className={`p-6 ${allCategories.length > 0 ? 'grid grid-cols-1 xl:grid-cols-2 gap-8 items-center min-h-75' : 'flex flex-col items-center justify-center py-16 text-center'}`}>
          {/* Chart or Empty State on the Left */}
          <div className={allCategories.length > 0 ? 'flex justify-center items-center w-full' : 'flex flex-col items-center justify-center text-center w-full'}>
            {chartCategories.length > 0 ? (
              <div aria-hidden="true" className="w-full max-w-sm">
                <ChartPieDonutText categories={chartCategories} />

                {/* Screen reader only table for accessibility */}
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
              <div className="flex flex-col items-center justify-center text-center h-full">
                <p className="text-sm text-muted-foreground mb-4">
                  {allCategories.length > 0
                    ? "No expenses yet for your categories."
                    : "No current categories or expenses."}
                </p>
                <AddCategoryModal />
              </div>
            )}
          </div>

          {/* Data on the Right */}
          {allCategories.length > 0 && (
            <div className="flex flex-col gap-10">
              {/* Total Amount */}
              {chartCategories.length > 0 && (
                <div className="flex flex-col gap-2">
                  <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                    Total
                  </span>
                  <div className="text-4xl lg:text-5xl font-mono text-foreground tracking-tighter flex items-baseline gap-1">
                    {formatCurrency(totalExpenses, currency).split('.')[0]}
                    <span className="text-xl lg:text-2xl text-muted-foreground font-medium">.{formatCurrency(totalExpenses, currency).split('.')[1]}</span>
                  </div>
                </div>
              )}

              {/* Available Categories */}
              <div className="flex flex-col gap-4">
                <h3 className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                  Available Categories
                </h3>
                <div className="flex flex-wrap gap-2">
                  {allCategories.map(cat => {
                    const iconObj = cat.icon ? AVAILABLE_ICONS.find(i => i.name === cat.icon) : null;
                    const Icon = iconObj?.icon || HelpCircle;

                    return (
                      <Badge
                        key={cat.id}
                        variant="outline"
                        className="gap-2 rounded-full bg-card/50 px-3 py-1.5 text-xs font-medium shadow-sm transition-colors hover:bg-card/80 justify-start"
                      >
                        <Icon size={14} className="shrink-0" style={{ color: cat.color || 'var(--muted)' }} />
                        <span className="text-foreground/90 truncate max-w-30">{cat.name}</span>
                      </Badge>
                    )
                  })}
                </div>
              </div>
            </div>
          )}
        </CardContent>
          <Link href='/finance/viewAllCategories' className='flex flex-row justify-end px-6'>
            <Button variant={'link'} className="group px-0 text-muted-foreground hover:text-foreground flex items-center gap-1">
                View All Categories <ArrowRight size={16} className="transition-transform duration-300 group-hover:translate-x-1" />
            </Button>
          </Link>
      </Card>
  )
}
