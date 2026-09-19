# Conventions

> Coding conventions for the **DASHBOARD** codebase.
> Follow these rules to keep the code consistent, searchable, and easy to maintain.

---

## Table of Contents

- [File & Folder Naming](#file--folder-naming)
- [Imports](#imports)
- [Components](#components)
- [Pages & Layouts](#pages--layouts)
- [Hooks](#hooks)
- [Validation Schemas](#validation-schemas)
- [Server Actions](#server-actions)
- [Types & Interfaces](#types--interfaces)
- [Constants](#constants)
- [Context Providers](#context-providers)
- [Styling](#styling)
- [shadcn/ui Usage](#shadcnui-usage)
- [Testing](#testing)

---

## File & Folder Naming

| Kind | Convention | Example |
| --- | --- | --- |
| Component files | PascalCase | `ExpenseTable.tsx` |
| Component folders | PascalCase | `components/Expenses/` |
| Hook files | camelCase, `use` prefix | `useCurrencyFilter.ts` |
| Server Action files | kebab-case | `add-expense.ts`, `daily-notes.ts` |
| Validation / Schema files | `schemas.ts` or camelCase | `schemas.ts`, `login.ts` |
| Type files | lowercase | `expenses.ts`, `database.ts` |
| Constant files | camelCase | `currencies.ts`, `options.ts` |
| Page / layout files | lowercase (Next.js convention) | `page.tsx`, `layout.tsx` |
| Client page wrappers | lowercase | `client.tsx` (sibling to `page.tsx`) |

---

## Imports

Organise imports in the following order, separated by blank lines:

```tsx
// 1. React / Next.js
import { useState } from "react"
import Link from "next/link"

// 2. Third-party libraries
import { useQuery } from "@tanstack/react-query"
import { z } from "zod"

// 3. shadcn/ui primitives
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

// 4. Local components
import { ExpenseTable } from "@/components/Expenses/ExpenseTable"

// 5. Hooks
import { useCurrencyFilter } from "@/hooks/useCurrencyFilter"

// 6. Lib (services, actions, utils)
import { fetchExpenses } from "@/lib/services/expenseService"

// 7. Types
import type { Expense } from "@/types/expenses"
```

- Always use the **`@/` path alias** — never relative paths like `../../`.
- Use `import type` when importing only types.

---

## Components

### Export & Declaration Style

- Use **named exports** for feature components.
- Both **function declarations** and **arrow function expressions** are acceptable:

```tsx
// ✅ Function declaration (preferred for forms, cards, modals)
export function WalletCard({ wallet }: WalletCardProps) { ... }

// ✅ Arrow function (common for feature widgets, sections)
export const NetWorthOverview = ({ wallets }: NetWorthProps) => { ... }
```

- **Default exports** are reserved for pages, layouts, and top-level shell components (Navbar, Sidebar, PageComponent).
- Client-interactive components must start with `"use client"`.

### Props Typing

- Define a `Props` interface directly above the component when props are non-trivial.
- Name it `ComponentNameProps`.
- For simple wrapper components, use `React.ComponentProps<"div">` or `{ children: React.ReactNode }`.

```tsx
// Named interface for non-trivial props
interface ExpenseTableProps {
  expenses: Expense[]
  onDelete: (id: string) => void
}

export function ExpenseTable({ expenses, onDelete }: ExpenseTableProps) { ... }

// Standard React types for wrappers
export function LoginForm({ className, ...props }: React.ComponentProps<"div">) { ... }
```

### Internal Structure

Follow this order inside every component file:

```tsx
"use client" // 1. Directive (if needed)

// 2. Imports (see Import ordering rules)

// 3. Type / interface definitions
interface MyComponentProps { ... }

// 4. Helper functions OUTSIDE the component (prevents recreation on render)
function getAmountFontSize(formatted: string): string { ... }

// 5. Component declaration
export function MyComponent({ data }: MyComponentProps) {
  // a. Hooks (useState, useQuery, custom hooks)
  // b. Side effects (useEffect)
  // c. Memoized values (useMemo)
  // d. Event handlers (useCallback when passed to children)
  // e. Early returns (loading, error, empty states)
  // f. Return JSX
}
```

### Accessibility

- Use semantic HTML elements (`<header>`, `<nav>`, `<main>`, `<section>`, `<aside>`).
- Add `aria-label`, `aria-labelledby`, and `aria-hidden` where appropriate.
- Use `sr-only` for screen-reader-only text.

---

## Pages & Layouts

### Server / Client Separation

Pages follow a **`page.tsx` → `client.tsx`** pattern:

- **`page.tsx`** is an async Server Component that handles auth checks and data fetching.
- **`client.tsx`** is a `"use client"` sibling that receives the data as props and handles all interactivity.

```tsx
// src/app/(main)/home/page.tsx  (Server Component)
import { getUser } from "@/lib/auth/user"
import { redirect } from "next/navigation"
import DashboardPage from "./client"

export default async function HomePage() {
  const user = await getUser()
  if (!user || !user.id) redirect("/login")

  const [tasks, notes] = await Promise.all([
    fetchTasks(user.id),
    fetchNotes(user.id),
  ])

  return <DashboardPage initialTasks={tasks} initialNotes={notes} />
}
```

```tsx
// src/app/(main)/home/client.tsx  (Client Component)
"use client"

import dynamic from "next/dynamic"

const HeavyChart = dynamic(() => import("@/components/Home/HeavyChart"), {
  ssr: false,
  loading: () => <Skeleton className="h-64" />,
})

export default function DashboardPage({ initialTasks, initialNotes }: Props) {
  // client-side state, hooks, interactivity
}
```

### Key Rules

- Pages are **Server Components** by default — only the `client.tsx` wrapper uses `"use client"`.
- Always **guard auth** at the top of `page.tsx` with `getUser()` + `redirect`.
- Use **`Promise.all`** for parallel data fetching in `page.tsx`.
- Use **`next/dynamic`** with `{ ssr: false }` for heavy or browser-only components.
- Export `metadata` from `page.tsx` when applicable.
- Keep pages thin — delegate rendering to feature components.

### Caching

- Use the `"use cache"` directive inside query helper functions for Next.js caching.
- Tag cache entries with `cacheTag()` and set lifetimes with `cacheLife()`.
- Invalidate caches from server actions with `updateTag()`.

---

## Hooks

- Prefix with `use` and use camelCase: `useCurrencyFilter`, `useRealTimeSync`.
- Use **named exports** with **function declarations**.
- Accept a config object when there are multiple parameters.
- Return an object with descriptive keys.
- Define explicit `Options` and `Result` interfaces for complex hooks.

```tsx
interface UseCurrencyFilterOptions {
  defaultCurrency?: string
}

export function useCurrencyFilter(
  expenses: Expense[],
  { defaultCurrency = "USD" }: UseCurrencyFilterOptions = {}
) {
  // state, effects, computations
  return { filteredExpenses, currencies, activeCurrency, setCurrency }
}
```

### Performance & Cleanup

- Always **clean up** side effects in `useEffect` return (`clearTimeout`, `removeChannel`, etc.).
- Use `useCallback` for functions returned to consumers or passed as props.
- Use `useMemo` for expensive computations.
- Use `useTransition` / `startTransition` for non-urgent state updates.
- Add `"use client"` when the hook accesses `window`, `navigator`, or other browser APIs.

---

## Validation Schemas

- **Auth/global schemas** live in `src/lib/validations/`.
- **Feature-specific schemas** can live alongside their component (e.g., `src/components/Modals/AddTransaction/schemas.ts`).
- Use **Zod** for all schemas.
- Export schemas as named camelCase constants with a `Schema` suffix.
- Derive TypeScript types with `z.infer`.
- Define **reusable field schemas** for common patterns (e.g., amount fields).
- Use **`.refine()`** for cross-field validation.
- Use **`z.coerce`** for form inputs that need type conversion.

```tsx
import { z } from "zod"

// Reusable field schema
const amountField = z.coerce.number().min(0.01, "Amount must be greater than 0")

export const expenseSchema = z.object({
  amount: amountField,
  category: z.string().min(1),
  description: z.string().optional(),
})

// Cross-field validation
export const transferSchema = z
  .object({
    fromAccountId: z.string(),
    toAccountId: z.string(),
    amount: amountField,
  })
  .refine((data) => data.fromAccountId !== data.toAccountId, {
    message: "Source and destination must be different accounts",
    path: ["toAccountId"],
  })

export type ExpenseFormData = z.infer<typeof expenseSchema>
export type TransferFormData = z.infer<typeof transferSchema>
```

---

## Server Actions

- Live in `src/lib/actions/` (and route-level `action.ts` files).
- File names are **kebab-case** (e.g., `add-expense.ts`, `daily-notes.ts`).
- File starts with `"use server"`.
- Named exported async functions.
- Always **guard auth** at the top of every action.
- Return a **standardized result object**: `{ success: boolean, message?: string, error?: string, data?: T }`.
- Wrap in `try/catch` with proper error extraction.
- Call `updateTag()` to **revalidate cache** after mutations.

```tsx
"use server"

import { getUser } from "@/lib/auth/user"
import { supabaseAdmin } from "@/lib/supabase/admin"
import { updateTag } from "next/cache"

export async function addExpenseAction(formData: ExpenseFormData) {
  const user = await getUser()
  if (!user) return { success: false, message: "Not authenticated." }

  try {
    const { error } = await supabaseAdmin
      .from("transactions")
      .insert({ ...formData, user_id: user.id })

    if (error) throw error

    updateTag(`expenses-${user.id}`)
    return { success: true, message: "Expense added." }
  } catch (error: unknown) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Something went wrong.",
    }
  }
}
```

---

## Types & Interfaces

- Live in `src/types/`, grouped by domain.
- Use **PascalCase** for all type and interface names.
- Use `interface` for object shapes, `type` for unions / intersections / utility types.
- Always use named exports.
- **`database.ts`** is the single source of truth — auto-generated from Supabase.
- **Derive domain types** from database types using `Pick`, `Omit`, and `&`:

```tsx
// src/types/database.ts — auto-generated, do not edit manually
export interface Transaction { id: string; amount: number; ... }
export interface ExpenseCategory { id: string; name: string; icon: string; color: string }

// src/types/expenses.ts — derived domain types
import type { Transaction, ExpenseCategory, Wallet } from "./database"

export type TransactionHistory = Transaction & {
  expense_categories: Pick<ExpenseCategory, "icon" | "name" | "color"> | null
  wallets: Pick<Wallet, "name" | "currency"> | null
}

export type WalletType = "Debit" | "Credit" | "Assets" | "Loans" | "Stocks" | "Crypto"
```

---

## Constants

- Live in `src/lib/constants/` — do **not** use `src/config/` (unused).
- Use **UPPER_SNAKE_CASE** for primitive values, regexes, and static option arrays.
- Use camelCase for complex config/styling objects.
- Always use named exports.
- Use **`as const`** for option arrays to preserve literal types.

```tsx
export const AUTOSAVE_DELAY = 5000
export const ITEMS_PER_PAGE = 60
export const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/

export const TRANSACTION_TYPE_OPTIONS = ["income", "expense", "transfer"] as const

export const WALLET_STYLES: Record<WalletType, { icon: LucideIcon; color: string }> = {
  Debit: { icon: CreditCard, color: "text-blue-500" },
  // ...
}
```

---

## Context Providers

- Live in `src/contexts/`.
- One context per file.
- Always export three things: the Context, the Provider component, and a custom `use*` hook.
- Mark with `"use client"`.

```tsx
"use client"

import { createContext, useContext, useState } from "react"

interface SyncStatusContextValue {
  isSyncing: boolean
  setIsSyncing: (v: boolean) => void
}

const SyncStatusContext = createContext<SyncStatusContextValue | null>(null)

export function SyncStatusProvider({ children }: { children: React.ReactNode }) {
  const [isSyncing, setIsSyncing] = useState(false)
  return (
    <SyncStatusContext.Provider value={{ isSyncing, setIsSyncing }}>
      {children}
    </SyncStatusContext.Provider>
  )
}

export function useSyncStatus() {
  const ctx = useContext(SyncStatusContext)
  if (!ctx) throw new Error("useSyncStatus must be used within SyncStatusProvider")
  return ctx
}
```

---

## Styling

- Use **Tailwind CSS utility classes** as the primary styling method.
- Use the **`cn()` helper** (`@/lib/utils`) for conditional / merged classes.
- Use **CSS variables** (defined in `globals.css`) for colors — never hard-code hex / rgb values.
- Use the **`motion`** library for complex animations and **`tw-animate-css`** for simple transitions.
- Do **not** write custom CSS files or use CSS modules.

```tsx
<div className={cn("rounded-lg border p-4", isActive && "border-primary bg-accent")}>
```

---

## shadcn/ui Usage

> **shadcn/ui is the single source of truth for all UI primitives.**

1. **Always check `src/components/ui/` first** before building any UI element.
2. **Add new components via the CLI**: `pnpm dlx shadcn@latest add <component>`.
3. **Wrap, don't modify** — if you need custom behavior, create a component in `src/components/` that composes the shadcn primitive. Do not edit files in `src/components/ui/` unless absolutely necessary.
4. **Icons** come from `lucide-react` only — do not mix icon libraries.
5. **Toast notifications** use `sonner` (the shadcn Sonner wrapper).
6. **Charts** use Recharts wrapped with the shadcn `<Chart />` component.

---

## Testing

- Use **Vitest** + **Testing Library**.
- Test files live in `src/__tests__/` and **must mirror the source folder structure**:

```
src/__tests__/
├── components/
│   └── Expenses/
│       └── ExpenseTable.test.tsx    ← mirrors components/Expenses/
├── hooks/
│   └── useCurrencyFilter.test.ts   ← mirrors hooks/
└── lib/
    └── services/
        └── expenseService.test.ts  ← mirrors lib/services/
```

- Name test files `<SourceFileName>.test.tsx` (or `.test.ts` for non-JSX).
- Use `describe` blocks named after the unit under test.
- Use `it` (not `test`) for individual test cases with descriptive names.

```tsx
describe("ExpenseTable", () => {
  it("renders a row for each expense", () => { ... })
  it("calls onDelete when the delete button is clicked", () => { ... })
})
```
