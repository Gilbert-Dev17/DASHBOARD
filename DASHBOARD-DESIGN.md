# DESIGN.md — Design System Record

> This document records the design system as it exists in the codebase. It is descriptive,
> not prescriptive. Values are extracted directly from source files; nothing is invented.

---

## 1. Design Tokens

### 1.1 Color Palette

All colors are defined as CSS custom properties in [`globals.css`](file:///Users/gilbertcura/Projectsfolder/DASHBOARD/src/app/globals.css#L80-L181), bridged to Tailwind via `@theme inline` directives. The system is monochrome with semantic financial-data color exceptions.

#### Semantic Token Values

| Token | Light | Dark | Usage |
|---|---|---|---|
| `--background` | `#ffffff` | `#0c0c0f` | Page backgrounds |
| `--foreground` | `#0a0a0a` | `#f4f4f5` | Primary text |
| `--card` | `#fafafa` | `#18181b` | Card surfaces |
| `--card-foreground` | `#0a0a0a` | `#f4f4f5` | Card text |
| `--popover` | `#ffffff` | `#0c0c0f` | Popover/dialog surfaces |
| `--popover-foreground` | `#0a0a0a` | `#f4f4f5` | Popover text |
| `--primary` | `#0a0a0a` | `#f4f4f5` | Primary buttons, switches, checkmarks |
| `--primary-foreground` | `#ffffff` | `#0c0c0f` | Text on primary surfaces |
| `--secondary` | `#f5f5f5` | `#1e1e22` | Secondary badges, hover fills |
| `--secondary-foreground` | `#0a0a0a` | `#f4f4f5` | Text on secondary |
| `--accent` | `#0a0a0a` | `#f4f4f5` | Menu focus highlight, timeline dot |
| `--accent-foreground` | `#ffffff` | `#0c0c0f` | Text on accent |
| `--muted` | `#fafafa` | `#18181b` | Skeletons, subtle fills |
| `--muted-foreground` | `#737373` | `#a0a0a8` | Secondary text, metadata, timestamps |
| `--destructive` | `#ef4444` | `#ef4444` | Form errors, delete actions |
| `--border` | `#e9e9e9` | `#2a2a30` | Borders, dividers |
| `--input` | `#e9e9e9` | `#2a2a30` | Form field borders |
| `--ring` | `#0a0a0a` | `#f4f4f5` | Focus rings |

#### Chart Colors (Monochrome Ramp)

| Token | Light | Dark |
|---|---|---|
| `--chart-1` | `#0a0a0a` | `#f4f4f5` |
| `--chart-2` | `#3a3a3a` | `#d4d4d8` |
| `--chart-3` | `#737373` | `#a0a0a8` |
| `--chart-4` | `#a3a3a3` | `#8a8a92` |
| `--chart-5` | `#d4d4d4` | `#3a3a42` |

#### Named Tailwind Colors Used Outside the Token System

These are raw Tailwind palette colors used for financial data semantics:

| Color | Where | Purpose |
|---|---|---|
| `text-emerald-500` | `SummaryExpense`, `RecentLogsSection`, `viewAll/client`, `accounts/[accountId]/client`, `NetWorthOverview`, `TransactionIcon` | Positive amounts, income indicators |
| `bg-emerald-500` | `SyncIndicator`, `DatabaseMetricsCard` | Sync connected dot, DB healthy dot |
| `bg-emerald-500/10` | `SummaryExpense`, `TransactionIcon` | Income icon container background |
| `text-rose-500` | `SummaryExpense`, `RecentLogsSection`, `viewAll/client`, `accounts/[accountId]/client`, `NetWorthOverview`, `TransactionIcon`, `DeleteWalletModal`, `DeleteTransactionItem` | Negative amounts, expense indicators, destructive menu items |
| `bg-rose-500` | `SyncIndicator`, `DatabaseMetricsCard`, `DeleteWalletModal` | Error dot, critical DB dot, delete button fill |
| `bg-rose-500/10` | `SummaryExpense`, `TransactionIcon`, `DeleteWalletModal` | Expense icon container, delete icon container |
| `text-rose-400` | `SummaryExpense` | Negative total balance display |
| `text-red-400` | `WalletCard` | Negative wallet balance text |
| `text-yellow-500` | `TransactionIcon` | Transfer transaction icon |
| `bg-yellow-500/10` | `TransactionIcon` | Transfer icon container |
| `text-blue-500` | `TransactionIcon` | Adjustment transaction icon |
| `bg-blue-500/10` | `TransactionIcon` | Adjustment icon container |
| `bg-amber-500` | `DatabaseMetricsCard` | DB warning capacity dot (50–80%) |
| `text-emerald-600` / `dark:text-emerald-400` | `AdjustBalanceModal` | Positive adjustment diff preview |
| `text-rose-600` / `dark:text-rose-400` | `AdjustBalanceModal` | Negative adjustment diff preview |

> **Inconsistency:** Negative wallet balance uses `text-red-400` in `WalletCard.tsx` but `text-rose-500` everywhere else.

#### Hardcoded Hex Values in JS/SVG

| Hex | File | Purpose |
|---|---|---|
| `#ef4444` | `accounts/[accountId]/client.tsx`, `WalletCard.tsx` | Liability account fallback color |
| `#888888` | `accounts/[accountId]/client.tsx` | Non-liability account fallback color |
| `#9ca3af` | `WalletCard.tsx` | Non-liability wallet card fallback color |
| `#4285F4`, `#34A853`, `#FBBC05`, `#EA4335` | `LoginForm.tsx`, `ProfileSettings.tsx` | Google brand SVG fills |

#### Opacity Patterns

Foreground opacity variants actually used: `text-foreground/90`, `text-foreground/80`, `text-foreground/60`.
Muted-foreground opacity variants: `text-muted-foreground/80`, `/70`, `/60`, `/50`, `/40`, `/30`.
Background opacity variants: `bg-card/30`, `bg-card/50`, `bg-card/60`, `bg-muted/50`, `bg-muted/30`, `bg-muted/20`, `bg-muted/10`, `bg-background/80`, `bg-background/50`, `bg-secondary/20`, `bg-secondary/40`, `bg-primary/20`, `border-border/50`.

---

### 1.2 Typography

#### Font Families

Declared in `layout.tsx`, mapped via CSS variables:

| Variable | Family | Source |
|---|---|---|
| `--font-sans` | Geist | `next/font/google` |
| `--font-geist-mono` | Geist Mono | `next/font/google` |
| `--font-source-serif` | Source Serif 4 (400, 600) | `next/font/google` |
| `--font-geist-pixel` | Geist Pixel (variable axis `ELSH`) | `next/font/google` + `@font-face` fallback in `globals.css` |

Tailwind mappings in `globals.css`:
```css
--font-sans: var(--font-sans);
--font-mono: var(--font-geist-mono);
--font-heading: var(--font-sans);
--font-serif: var(--font-source-serif);
--font-pixel: 'Geist Pixel', var(--font-geist-mono), ui-monospace, monospace;
```

#### Geist Pixel Axis Utilities

Defined in `globals.css`:
```css
@utility font-pixel-square   { font-variation-settings: "ELSH" 1;  }
@utility font-pixel-circle   { font-variation-settings: "ELSH" 20; }
@utility font-pixel-grid     { font-variation-settings: "ELSH" 40; }
@utility font-pixel-triangle { font-variation-settings: "ELSH" 60; }
@utility font-pixel-line     { font-variation-settings: "ELSH" 80; }
```

#### Font Size Classes Actually Used

| Size | Representative Locations |
|---|---|
| `text-[10px]` | FullCalendar task pills, task count indicator |
| `text-[11px]` | Micro-labels everywhere: section headers, metadata, timestamps. Used raw and via `.micro-label` utility |
| `text-xs` | Form labels, badge text, wallet card metadata, chart annotations, table cells, modal field labels |
| `text-[0.8rem]` | Calendar day numbers |
| `text-sm` | Default body text, form inputs, card descriptions, table content, navigation labels, dialog/drawer text |
| `text-base` | Card titles, modal titles, dialog titles, form section headers |
| `text-lg` | Wallet card balance tiers, category section totals, FullCalendar stat category label, delete task modal task name |
| `text-xl` | Wallet card balance tier, agenda title (mobile), SummaryExpense net worth tier |
| `text-2xl` | GreetingHeader message (mobile), login heading, agenda title (desktop), profile avatar fallback, AdjustBalance preview, SummaryExpense/NetWorthOverview tiers |
| `text-3xl` | GreetingHeader message (md), account detail heading, profile avatar fallback (lg), SummaryExpense/CategoryCharts totals, HeaderTitle (md), weather card temperature |
| `text-[2.75rem]` | HeaderTitle (custom intermediate size) |
| `text-4xl` | GreetingHeader message (lg), account detail balance, FullCalendar categorical focus number, weather card temperature (lg) |
| `text-5xl` | Profile user name (base), NetWorthOverview net worth tier, FullCalendar watermark text |
| `text-6xl` | Profile user name (md), GreetingHeader day-of-week (base) |
| `text-7xl` | Profile user name (lg) |
| `text-8xl` | GreetingHeader day-of-week (md) |
| `text-[9rem]` | GreetingHeader day-of-week (lg) |

#### Font Weights Actually Used

| Weight | Class | Locations |
|---|---|---|
| 300 | `font-light` | GreetingHeader message text, profile user name, account detail heading, weather card temperature, sidebar user label |
| 400 | `font-normal` | Calendar day numbers, field descriptions, rarely explicit |
| 500 | `font-medium` | Default for most UI: buttons, cards, labels, form fields, nav items, table cells, transaction names, task names, modal titles |
| 600 | `font-semibold` | Section headers, micro-labels with emphasis, GreetingHeader bold spans, category section headers, wallet grid headers, nav action buttons, form submission buttons, calendar day header labels |
| 700 | `font-bold` | Profile page user name, delete task modal task name, login heading, GreetingHeader name highlight, FullCalendar today indicator |

#### The `.micro-label` Utility

Defined in `globals.css`:
```css
.micro-label {
  font-family: var(--font-geist-mono), ui-monospace, monospace;
  font-size: 0.6875rem; /* 11px */
  text-transform: uppercase;
  letter-spacing: 0.06em;
  line-height: 1;
}
```

Used in: `GreetingHeader.tsx` (badge chips), `LoginForm.tsx` (label). In many other places, the same style is manually composed as `font-mono text-[11px] uppercase tracking-wider` instead of using the utility class.

---

### 1.3 Base Font Size

`globals.css`:
```css
html { font-size: 15px; }
```
All `rem`-based sizes are relative to this 15px base, not the browser default 16px.

---

### 1.4 Radius

Defined in `globals.css`:
```
--radius-sm: 0.375rem  (6px)   --radius-md: 0.5rem    (8px)
--radius-lg: 0.75rem   (12px)  --radius-xl: 1rem      (16px)
--radius-2xl: 1.25rem          --radius-3xl: 1.5rem
--radius-4xl: 2rem             --radius: 0.75rem (base)
```

**Actual usage is inconsistent:**
- `Card` component: `rounded-xl` (default)
- `Button` component: `rounded-lg` (default), smaller sizes use `rounded-[min(var(--radius-md),10px)]` or `rounded-[min(var(--radius-md),12px)]`
- Many application-level elements override to `rounded-none`: FullCalendar buttons, schedule loading skeletons, finance loading skeletons, viewAll table/inputs/selects
- `NotesSection` trigger: `rounded-md`
- `WalletCard`: `rounded-xl` with hover lift
- Account detail statement section: `rounded-3xl`
- `Navbar`/`Sidebar`: `rounded-md` (desktop), `rounded-2xl` (mobile bar)
- `Badge`: `rounded-4xl` (pill shape)

---

### 1.5 Shadows

Defined in `globals.css`:
**Light:**
```css
--shadow-card: 0 8px 22px -14px rgba(0,0,0,0.25);
--shadow-card-hover: 0 18px 36px -20px rgba(0,0,0,0.4);
```
- `Card` component uses `shadow-[var(--shadow-card)]` by default
- `WalletCard`: `shadow-sm` with hover lift (`group-hover:-translate-y-1`)
- Navbar/Sidebar/Mobilebar: `shadow-lg`
- Loading skeletons and FullCalendar grid cells: `shadow-sm` on the outer border container

---

## 2. Layout Patterns

### 2.1 Page Shell

**Root layout** (`layout.tsx`):
`<html>` → `<body className="min-h-full flex flex-col">` → `<Providers>` → `<Suspense>` → `<TooltipProvider>` → `{children}`
`<Toaster position="top-center" />` is mounted at body level.

**Main layout** (`(main)/layout.tsx`):
```
<section className="min-h-full flex flex-col">
  <div className="lg:hidden"><Mobilebar /></div>     <!-- Mobile: bottom floating bar -->
  <div className="hidden lg:block"><Sidebar /></div>  <!-- Desktop: fixed left sidebar -->
  <main className="flex-1 pb-24 lg:pb-0">{children}</main>
</section>
```

**PageComponent wrapper** (`PageComponent.tsx`):
```tsx
<section className="w-full max-w-7xl mx-auto p-6 animation-fade-in flex flex-col min-h-[calc(100vh-5rem)]">
```

### 2.2 Per-Page Layouts

| Page | Layout | Grid |
|---|---|---|
| **Home** | Single column, vertically centered content + `mt-auto` bottom progress | No grid |
| **Finance** | Top summary → `grid-cols-1 lg:grid-cols-12 gap-4 mt-4` with `lg:col-span-8` (wallets + categories) + `lg:col-span-4` (income/expense + recent logs) | 12-col at lg |
| **Schedule (CustomC=true)** | Full viewport `min-h-[calc(100vh-7rem)]` single FullCalendar component | 7-col internal calendar grid |
| **Schedule (fallback)** | Mobile: vertical stack. Desktop: `grid-cols-12 gap-6 lg:h-[calc(100vh-7rem)]` with `lg:col-span-4` (calendar + notes) + `lg:col-span-8` (agenda) | 12-col at lg |
| **Profile** | Single column `space-y-6` stack | No grid |
| **viewAllAccounts** | `grid-cols-1 md:grid-cols-2 gap-6` wallet cards per currency group | 2-col at md |
| **viewAllCategories** | `grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4` | Progressive columns |

---

## 3. Component Inventory

### 3.1 `ui/` Primitives

| Component | Props/Signatures | Variants / Usage |
|---|---|---|
| `button.tsx` | `variant`, `size`, `asChild` | Variants: `default`, `outline`, `secondary`, `ghost`, `destructive`, `link`. Sizes: `default`, `xs`, `sm`, `lg`, `icon`, `icon-xs`, `icon-sm`, `icon-lg`. Used globally. |
| `card.tsx` | `Card`, `CardHeader`, `CardTitle`, `CardDescription`, `CardContent`, `CardFooter` | Variants: `default` (bg-card border shadow), `dashed` (border-dashed bg-card/30). Sizes: `default`, `sm`. Used in Profile, viewAllCategories. |
| `badge.tsx` | `Badge` (variant, asChild) | Variants: `default`, `secondary`, `destructive`, `outline`, `ghost`, `link`. Used for chips, category badges. |
| `drawer.tsx` | `Drawer` via `@base-ui/react/drawer` | Configured via `--drawer-content-width` CSS variable. Standard `w-[...]` classes do not affect width. |
| `empty.tsx` | `Empty`, `EmptyMedia`, `EmptyTitle`, `EmptyDescription`, `EmptyContent` | Media variants: `default`, `icon`. Standard zero-data state. |
| `dialog.tsx` | `Dialog`, `DialogContent`, `DialogHeader`, `DialogTitle` | Used for all modals (AddTransaction, AddWallet, QuickAdd). |
| `field.tsx` | `Field`, `FieldLabel`, `FieldError` | Standard form field wrapper with validation state coloring (`text-destructive`). |
| `timeline.tsx` | `Timeline`, `TimelineItem`, `TimelineDot`, `TimelineContent` | Used in AgendaSection task list and account statement history. |

### 3.2 Shared Components

| Component | Props | Purpose |
|---|---|---|
| `AgendaSection.tsx` | `initialTasks: TaskWithSubtasks[]`, `selectedDateStr?: string`, `showTitle?: boolean` | Task list component, used in schedule and FullCalendar drawer. |
| `NotesSection.tsx` | `note?: Notes \| null`, `dateStr: string`, `userId: string` | Daily journal/notes text area. |
| `CurrencySwitcher.tsx` | `currencies: string[]`, `activeCurrency: string`, `onCurrencyChange: (c: string) => void` | Used in finance headers. |
| `TransactionIcon.tsx` | `type: TransactionType` | Maps types ('income', 'expense', 'transfer', 'adjustment') to specific colors and icons. |
| `LoadingState.tsx` | None | Centered spinner with pulsing background used for full-page loading transitions. |

### 3.3 Domain Components

| Domain | Components |
|---|---|
| **Home** | `GreetingHeader`, `LifeProgress`, `NetWorthOverview` |
| **Finance** | `SummaryExpense` (hero card + sparkline), `WalletGrid` (wallet list), `CategorySection` (donut chart + list), `RecentLogsSection` (log list), `WalletCard` (individual card) |
| **Schedule** | `FullCalendar` (month/week grid with day drawer) |
| **Profile** | `ThemeToggle` (animated light/dark switch), `ProfileSettings`, `DatabaseMetricsCard` |

### 3.4 Modals (`/components/Modals/`)

| Modal | Props |
|---|---|
| `AddCategoryModal.tsx` | `open?: boolean`, `onOpenChange?: (open: boolean) => void`, `isControlled?: boolean` (allows use inside Select dropdowns) |
| `AddWalletModal.tsx` | `open?: boolean`, `onOpenChange?: (open: boolean) => void`, `isControlled?: boolean` |
| `AddTransactionModal.tsx` | Contains tabbed forms: `ExpenseForm`, `IncomeForm`, `TransferForm` |
| `AdjustBalanceModal.tsx` | `wallet: Wallet`, `isOpen: boolean`, `setIsOpen: (open: boolean) => void` |
| `DeleteTaskModal.tsx` | `taskId: string`, `taskName: string`, `onDeleted?: () => void` |
| `QuickAddModal.tsx` | NLP task entry via `cmdk` |

---

## 4. UI States

### 4.1 Loading States

Two strategies are used:

**Strategy A: Structural Skeleton** — Home, Finance, Schedule, Profile, Account Detail.
Each has a dedicated `loading.tsx` that renders `<Skeleton>` blocks matching the layout proportions. Skeleton style: `rounded-none bg-muted/50` (for home/finance/schedule skeletons) or `rounded-md bg-muted` (default component).

**Strategy B: Centered Spinner** — `(main)/loading.tsx`, viewAll, viewAllAccounts, viewAllCategories.
Uses `<LoadingState />`: a centered `Loader2` spinner with `animate-spin` over an `animate-pulse bg-primary/20` blurred halo.

### 4.2 Empty States

Consistently use the `<Empty>` compound component in most places.
> **Inconsistency:** viewAllAccounts and viewAllCategories empty states use a raw `<div className="flex w-full flex-col items-center justify-center rounded-xl border border-dashed py-12 bg-card/30">` instead of the `<Empty>` component.

### 4.3 Error / Success Feedback

All user feedback flows through **Sonner toasts** (`toast.success`, `toast.error`, `toast.loading`).
Form validation errors use `<FieldError>` component with `text-destructive` styling.

### 4.4 Hover/Focus Treatments

**Buttons:** `default`: `hover:bg-primary/80`. `ghost`: `hover:bg-muted hover:text-foreground`.
**Focus Ring:** `focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50`.
**Table Rows:** `hover:bg-muted/50` (base table), `hover:bg-secondary/20` (viewAll).
**Group Hover:** `group-hover:translate-x-1` (Arrow icon slide in RecentLogsSection/WalletGrid), `text-foreground/90 group-hover:text-foreground` (Transaction names).

---

## 5. Motion & Transitions

### 5.1 CSS Transitions

**Global theme transition** (`globals.css`):
```css
html:not([data-no-transition]) * {
  transition-property: color, background-color, border-color;
  transition-duration: 500ms;
}
```
This applies a 500ms crossfade to every element on theme switch.

**Duration tiers observed:**
- `duration-200`: WalletCard hover lift
- `duration-300`: Nav link scale, hover arrow slides, button transitions
- `duration-450`: Drawer overlay + popup (custom bezier)
- `duration-500`: ThemeToggle Sun/Moon rotation, sidebar user label expand, modal icon color

### 5.2 View Transitions API

Used in `ThemeToggle.tsx` for native hardware-accelerated crossfades during theme switching:
```tsx
if (!document.startViewTransition) { setTheme(newTheme); return; }
document.startViewTransition(() => { setTheme(newTheme) })
```

### 5.3 Framer Motion

Package `"motion": "^12.40.0"` is declared in `package.json` but **zero source files import or use it**.

---

## 6. Naming & Conventions

- **React components:** PascalCase (`GreetingHeader.tsx`)
- **Page files:** lowercase (`page.tsx`, `client.tsx`, `loading.tsx`)
- **Utilities/hooks:** camelCase (`useCurrencyFilter.ts`)
- **UI primitives:** kebab-case (`alert-dialog.tsx`, `dropdown-menu.tsx`)

---

## 7. Known Inconsistencies

| Area | Description |
|---|---|
| **Negative balance color** | `WalletCard.tsx` uses `text-red-400`. All other finance components use `text-rose-500`. |
| **`.micro-label` usage** | The utility class exists but is only used in 2 files. Most places manually write `font-mono text-[11px] uppercase tracking-wider text-muted-foreground`. |
| **Border radius** | No single convention. FullCalendar controls use `rounded-none`. Cards use `rounded-xl`. Skeletons mix `rounded-none` and `rounded-md`. |
| **Card wrapper usage** | Finance page WalletGrid and CategorySection were stripped to raw elements. Profile ThemeToggle and ProfileSettings still wrap content in `<Card>`. |
| **Framer Motion** | Listed as a dependency but never imported or used. |
| **Drawer width control** | `FullCalendar.tsx` uses CSS variable overrides (`[--drawer-content-width:...]`) because standard Tailwind `w-[...]` classes don't work with the `@base-ui/react` drawer. |
