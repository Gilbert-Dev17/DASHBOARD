
import { ChartPieDonutText } from '@/components/shared/CategoryCharts'
import { AddCategoryModal } from '@/components/modals/add-category/AddCategoryModal'
import { TransactionHistory, CategorySummary } from '@/types/expenses'
import { ExpenseCategory } from '@/types/database'

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
          <p className="text-sm text-muted-foreground mb-4">No current categories or expenses.</p>
          <AddCategoryModal />
        </div>
      ) : (
        <div aria-hidden="true" className="bg-card/30 border rounded-xl p-6">
          <ChartPieDonutText categories={chartCategories} />
        </div>
      )}
    </section>
  )
}
