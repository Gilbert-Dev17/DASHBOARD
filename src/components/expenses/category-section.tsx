
import { ChartPieDonutText } from '@/components/shared/CategoryCharts'
import { AddCategoryModal } from '@/components/modals/add-category/AddCategoryModal'
import { TransactionHistory, CategorySummary } from '@/types/expenses'
import { ExpenseCategory } from '@/types/database'
import { formatCurrency } from '@/utils/currency'
import { Badge } from '@/components/ui/badge'

interface CategorySectionProps {
  transactions: TransactionHistory[];
  allCategories?: ExpenseCategory[];
}

export const CategorySection = ({ transactions, allCategories = [] }: CategorySectionProps) => {

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

  return (
    <section className="flex flex-col gap-6" aria-labelledby="categories-heading">
      <header className="flex justify-between items-center shrink-0">
        <h2 id="categories-heading" className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Categories</h2>
        <AddCategoryModal />
      </header>

      {chartCategories.length === 0 ? (
        <div className="bg-card/30 border rounded-xl p-6 flex flex-col items-center justify-center py-16 text-center">
          <p className="text-sm text-muted-foreground mb-4">
            {allCategories.length > 0
              ? "No expenses yet for your categories."
              : "No current categories or expenses."}
          </p>
          <AddCategoryModal />
        </div>
      ) : (
        <>
          <div aria-hidden="true" className="bg-card/30 border rounded-xl p-6">
            <ChartPieDonutText categories={chartCategories} />
          </div>

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
                  <td>{formatCurrency(cat.total || 0, 'PHP')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}

   {/* Available Categories Section */}
      {allCategories.length > 0 && (
        <div className="mt-2 flex flex-col gap-3">
          <h3 className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            Available Categories
          </h3>
          <div className="flex flex-wrap gap-2">
            {allCategories.map(cat => (
              <Badge
                key={cat.id}
                variant="outline"
                className="gap-2 rounded-full bg-card/50 px-3 py-1.5 text-xs font-medium shadow-sm"
              >
                <div
                  className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: cat.color || 'var(--muted)' }}
                />
                <span className="text-foreground/90">{cat.name}</span>
              </Badge>
            ))}
          </div>
        </div>
      )}
    </section>
  )
}
