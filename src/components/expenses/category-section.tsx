
import { ChartPieDonutText } from '@/components/shared/CategoryCharts'
import { AddCategoryModal } from '@/components/modals/add-category/AddCategoryModal'
import { formatCurrency } from '@/utils/currency'
import { TransactionHistory, CategorySummary } from '@/types/expenses'
import { HelpCircle } from 'lucide-react'
import { ICON_MAP } from './expensesPage'
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
    <section className="lg:col-span-7 flex flex-col gap-6" aria-labelledby="categories-heading">
      <header className="flex justify-between items-center shrink-0">
        <h2 id="categories-heading" className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Categories</h2>
        <AddCategoryModal />
      </header>

      <div aria-hidden="true" className="bg-card/30 border rounded-xl p-6">
        <ChartPieDonutText categories={chartCategories} />
      </div>

      {/* <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 shrink-0">
        {categories.map((category) => {
          const Icon = category.icon ? (ICON_MAP[category.icon] || HelpCircle) : HelpCircle;
          return (
            <div key={category.name} className="flex items-center gap-4 p-4 rounded-xl border border-dashed bg-card/30 hover:bg-secondary/40 transition-colors group">
              <div className="bg-secondary text-muted-foreground p-3 rounded-full shrink-0 group-hover:text-foreground transition-colors">
                <Icon size={18} />
              </div>
              <div className="flex flex-col overflow-hidden">
                <span className="font-medium text-sm text-foreground/90 truncate">{category.name}</span>
                <span className="tabular-nums font-mono text-sm leading-tight text-foreground/80 group-hover:text-foreground">
                  {formatCurrency(category.total || 0, 'PHP')}
                </span>
              </div>
            </div>
          )
        })}
      </div> */}
    </section>
  )
}
