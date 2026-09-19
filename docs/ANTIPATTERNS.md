# Anti-Patterns

> Common mistakes to avoid in the **DASHBOARD** codebase.
> Each entry explains what the problem is, why it matters, and what to do instead.

---

## Table of Contents

- [Data Fetching](#data-fetching)
- [State Management](#state-management)
- [Server Actions](#server-actions)
- [Components](#components)
- [Styling](#styling)
- [Types](#types)
- [File Organization](#file-organization)
- [Performance](#performance)

---

## Data Fetching

### ❌ Fetching inside `useEffect`

```tsx
// ❌ Don't do this
useEffect(() => {
  fetch("/api/expenses").then(res => res.json()).then(setExpenses)
}, [userId])
```

**Why:** No caching, no deduplication, no loading/error states, refetches on every render cycle, memory leaks on unmount.

```tsx
// ✅ Do this instead
const { data: expenses } = useQuery({
  queryKey: ["expenses", userId],
  queryFn: () => fetchExpenses(userId),
})
```

---

### ❌ Fetching in a Client Component when a Server Component would do

```tsx
// ❌ Don't fetch in a Client Component for data that doesn't need interactivity
"use client"
export function ExpenseSummary() {
  const { data } = useQuery({ queryFn: fetchExpenses })
  return <div>{data?.total}</div>
}
```

**Why:** Delays rendering, sends an extra round-trip, and misses RSC streaming benefits.

```tsx
// ✅ Fetch in page.tsx (Server Component), pass as initialData
// page.tsx
const expenses = await fetchExpenses(user.id)
return <ExpenseSummaryClient initialExpenses={expenses} />

// ExpenseSummaryClient.tsx
const { data } = useQuery({ queryFn: fetchExpenses, initialData: initialExpenses })
```

---

### ❌ Sequential fetches that could be parallel

```tsx
// ❌ Waterfall — each waits for the previous
const wallets = await fetchWallets(user.id)
const expenses = await fetchExpenses(user.id)
const notes = await fetchNotes(user.id)
```

```tsx
// ✅ Parallel — all fire at once
const [wallets, expenses, notes] = await Promise.all([
  fetchWallets(user.id),
  fetchExpenses(user.id),
  fetchNotes(user.id),
])
```

---

### ❌ Missing `initialData` on client queries

```tsx
// ❌ Causes a loading flash even though page.tsx already fetched the data
const { data, isLoading } = useQuery({ queryFn: fetchExpenses })
if (isLoading) return <Skeleton />
```

```tsx
// ✅ Pass initialData from the server to hydrate immediately
const { data } = useQuery({
  queryFn: fetchExpenses,
  initialData: props.initialExpenses,
})
```

---

## State Management

### ❌ Storing server-fetched data in Zustand

```tsx
// ❌ Don't mirror server data into a Zustand store
const useExpenseStore = create((set) => ({
  expenses: [],
  setExpenses: (expenses) => set({ expenses }),
}))
```

**Why:** Creates a second source of truth that drifts from the server. Zustand has no built-in cache invalidation or refetch logic.

```tsx
// ✅ Server data lives in React Query; Zustand is for client-only UI state
const { data: expenses } = useQuery({ queryKey: ["expenses"], queryFn: fetchExpenses })

// Zustand is correct for things like:
const useUIStore = create((set) => ({
  isSidebarOpen: false,
  activeFilter: "all",
}))
```

---

### ❌ Using React Context for frequently-updated data

```tsx
// ❌ Re-renders every consumer on every change — painful at scale
const ExpenseContext = createContext()
export function ExpenseProvider({ children }) {
  const [expenses, setExpenses] = useState([])
  // Any update here re-renders ALL consumers
  return <ExpenseContext.Provider value={{ expenses, setExpenses }}>{children}</ExpenseContext.Provider>
}
```

**Why:** Context has no selector support — every subscriber re-renders on every value change.

```tsx
// ✅ Use React Query for server data; Zustand (with selectors) for global UI state
// Context is reserved for narrow, low-frequency state like SyncStatusContext
```

---

### ❌ Calling `setState` inside `useEffect` for derived values

```tsx
// ❌ Derived state — unnecessary effect + extra render
const [filteredExpenses, setFilteredExpenses] = useState([])
useEffect(() => {
  setFilteredExpenses(expenses.filter(e => e.currency === activeCurrency))
}, [expenses, activeCurrency])
```

```tsx
// ✅ Derive synchronously with useMemo
const filteredExpenses = useMemo(
  () => expenses.filter(e => e.currency === activeCurrency),
  [expenses, activeCurrency]
)
```

---

## Server Actions

### ❌ Skipping the auth guard

```tsx
// ❌ Any authenticated-looking request can call this
"use server"
export async function deleteExpenseAction(id: string) {
  await supabaseAdmin.from("transactions").delete().eq("id", id)
}
```

```tsx
// ✅ Always guard first
"use server"
export async function deleteExpenseAction(id: string) {
  const user = await getUser()
  if (!user) return { success: false, message: "Not authenticated." }

  await supabaseAdmin.from("transactions").delete().eq("id", id).eq("user_id", user.id)
  updateTag(`expenses-${user.id}`)
  return { success: true }
}
```

---

### ❌ Calling a Server Action from another Server Action

```tsx
// ❌ Server Actions are entry points — do not chain them
"use server"
export async function addExpenseAction(data) {
  await validateBudgetAction(data)  // ← another Server Action
}
```

**Why:** Server Actions are HTTP endpoints under the hood. Chaining them adds unnecessary overhead.

```tsx
// ✅ Extract shared logic into a regular async function in lib/services/
import { validateBudget } from "@/lib/services/budgetService"

export async function addExpenseAction(data) {
  await validateBudget(data)  // ← plain function, not a Server Action
}
```

---

### ❌ Not calling `updateTag()` after a mutation

```tsx
// ❌ DB is updated but the page still shows stale cached data
export async function addExpenseAction(data) {
  await supabaseAdmin.from("transactions").insert(data)
  return { success: true }
}
```

```tsx
// ✅ Always revalidate the relevant cache tag
export async function addExpenseAction(data) {
  const user = await getUser()
  await supabaseAdmin.from("transactions").insert({ ...data, user_id: user.id })
  updateTag(`expenses-${user.id}`)
  return { success: true }
}
```

---

### ❌ Returning raw error objects

```tsx
// ❌ Leaks internal error details and breaks the expected return shape
export async function addExpenseAction(data) {
  try { ... } catch (error) {
    return { error }  // ← raw Error object, not serializable
  }
}
```

```tsx
// ✅ Always return the standardized result shape
return {
  success: false,
  error: error instanceof Error ? error.message : "Something went wrong.",
}
```

---

## Components

### ❌ Modifying files in `src/components/ui/`

```tsx
// ❌ Do not edit shadcn primitives directly
// src/components/ui/button.tsx  ← hands off
```

**Why:** shadcn components are re-generated via CLI. Manual edits get wiped out on upgrade.

```tsx
// ✅ Wrap and extend in src/components/
// src/components/Shared/IconButton.tsx
import { Button } from "@/components/ui/button"

export function IconButton({ icon: Icon, ...props }: IconButtonProps) {
  return <Button {...props}><Icon className="mr-2 h-4 w-4" />{props.children}</Button>
}
```

---

### ❌ Default-exporting feature components

```tsx
// ❌ Default exports are hard to search and refactor
export default function ExpenseTable() { ... }
```

```tsx
// ✅ Named exports for all feature components
export function ExpenseTable() { ... }

// Default exports are only for: pages, layouts, top-level shell components
```

---

### ❌ Defining helper functions inside the component body

```tsx
// ❌ This function is recreated on every render
export function WalletCard({ amount }: Props) {
  function formatAmount(n: number) { return n.toFixed(2) }  // ← recreated every render
  return <div>{formatAmount(amount)}</div>
}
```

```tsx
// ✅ Define helpers outside the component
function formatAmount(n: number) { return n.toFixed(2) }

export function WalletCard({ amount }: Props) {
  return <div>{formatAmount(amount)}</div>
}
```

---

### ❌ Missing `"use client"` on components that use browser APIs

```tsx
// ❌ Will throw at build time — window is not available in RSC
export function ThemeToggle() {
  const isDark = window.matchMedia("(prefers-color-scheme: dark)").matches
  ...
}
```

```tsx
// ✅ Add "use client" at the top
"use client"
export function ThemeToggle() { ... }
```

---

## Styling

### ❌ Hard-coding color values

```tsx
// ❌ Bypasses the theme system — breaks dark mode
<div className="bg-[#1a1a2e] text-[#e0e0e0]">
```

```tsx
// ✅ Use CSS variables defined in globals.css
<div className="bg-background text-foreground">
```

---

### ❌ Writing custom CSS files or CSS modules

```css
/* ❌ src/components/ExpenseTable.module.css — don't create these */
.table { border-collapse: collapse; }
```

```tsx
// ✅ Use Tailwind utility classes
<table className="border-collapse w-full">
```

---

### ❌ Mixing icon libraries

```tsx
// ❌ Do not mix icon sets
import { Trash } from "lucide-react"
import { FaWallet } from "react-icons/fa"   // ← different library
import DeleteIcon from "@mui/icons-material/Delete"  // ← different library
```

```tsx
// ✅ Lucide React only
import { Trash, Wallet } from "lucide-react"
```

---

## Types

### ❌ Manually editing `database.ts`

```tsx
// ❌ src/types/database.ts is auto-generated from Supabase — do not edit
export interface Transaction {
  id: string
  my_custom_field: string  // ← will be overwritten on next generation
}
```

```tsx
// ✅ Extend in domain type files using Pick / Omit / &
// src/types/expenses.ts
import type { Transaction } from "./database"

export type TransactionWithMeta = Transaction & {
  formattedAmount: string
}
```

---

### ❌ Using `any` for unknown data shapes

```tsx
// ❌ Kills type safety
const handleAction = async (data: any) => { ... }
```

```tsx
// ✅ Use unknown + type narrowing, or a Zod schema
const handleAction = async (data: unknown) => {
  const parsed = expenseSchema.parse(data)
  ...
}
```

---

## File Organization

### ❌ Importing from `src/config/`

```tsx
// ❌ This directory is unused — do not create or import from it
import { APP_CONFIG } from "@/config/app"
```

```tsx
// ✅ Constants live in src/lib/constants/
import { AUTOSAVE_DELAY } from "@/lib/constants/timings"
```

---

### ❌ Using relative imports instead of the `@/` alias

```tsx
// ❌ Fragile — breaks when files move
import { ExpenseTable } from "../../components/Expenses/ExpenseTable"
```

```tsx
// ✅ Always use the @/ alias
import { ExpenseTable } from "@/components/Expenses/ExpenseTable"
```

---

### ❌ Flat test files — not mirroring source structure

```
// ❌ Hard to find which file a test covers
src/__tests__/
├── ExpenseTable.test.tsx
├── useCurrencyFilter.test.ts
└── expenseService.test.ts
```

```
// ✅ Mirror the source folder structure
src/__tests__/
├── components/Expenses/ExpenseTable.test.tsx
├── hooks/useCurrencyFilter.test.ts
└── lib/services/expenseService.test.ts
```

---

## Performance

### ❌ Not cleaning up Supabase Realtime channels

```tsx
// ❌ Memory leak — channel keeps running after component unmounts
useEffect(() => {
  supabase.channel("expenses").on(...).subscribe()
}, [])
```

```tsx
// ✅ Always remove the channel in the cleanup function
useEffect(() => {
  const channel = supabase.channel("expenses").on(...).subscribe()
  return () => { supabase.removeChannel(channel) }
}, [])
```

---

### ❌ Using `next/dynamic` without a loading fallback for critical UI

```tsx
// ❌ Layout shift — content pops in with no placeholder
const HeavyChart = dynamic(() => import("@/components/Home/HeavyChart"), { ssr: false })
```

```tsx
// ✅ Always provide a Skeleton fallback
const HeavyChart = dynamic(() => import("@/components/Home/HeavyChart"), {
  ssr: false,
  loading: () => <Skeleton className="h-64 w-full" />,
})
```

---

### ❌ Passing unstable object/array literals as props

```tsx
// ❌ New reference on every render → child always re-renders
<ExpenseChart config={{ currency: "USD", period: "month" }} />
```

```tsx
// ✅ Memoize or define outside the component
const chartConfig = useMemo(() => ({ currency, period }), [currency, period])
<ExpenseChart config={chartConfig} />

// Or if static:
const CHART_CONFIG = { currency: "USD", period: "month" }
<ExpenseChart config={CHART_CONFIG} />
```
