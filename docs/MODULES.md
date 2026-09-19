# Modules

> Module responsibilities and import rules for the **DASHBOARD** codebase.
> Each module has a defined purpose and a strict set of allowed/forbidden dependencies.
> Violating these boundaries causes circular imports, bloated bundles, and logic in the wrong layer.

---

## Table of Contents

- [Dependency Graph](#dependency-graph)
- [Module Reference](#module-reference)
  - [app/](#app)
  - [components/](#components)
  - [hooks/](#hooks)
  - [contexts/](#contexts)
  - [lib/actions/](#libactions)
  - [lib/services/](#libservices)
  - [lib/auth/](#libauth)
  - [lib/supabase/](#libsupabase)
  - [lib/constants/](#libconstants)
  - [lib/validations/](#libvalidations)
  - [lib/finance/](#libfinance)
  - [types/](#types)
  - [utils/](#utils)
- [Forbidden Patterns](#forbidden-patterns)

---

## Dependency Graph

Read the arrows as **"may import from"**. Lower layers must never import from higher layers.

```
┌─────────────────────────────────────────────────────┐
│  app/  (pages, layouts, API routes)                 │
│    │  may import everything below                   │
└──────────────────────┬──────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────┐
│  components/   hooks/   contexts/                   │
│    │             │           │                      │
│    └─────────────┴───────────┘                      │
│          may import: lib/*, types/, utils/          │
│          must NOT import: app/                      │
└──────────────────────┬──────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────┐
│  lib/actions/   lib/services/                       │
│    │                 │                              │
│    └─────────────────┘                              │
│    may import: lib/auth/, lib/supabase/,            │
│                lib/constants/, lib/validations/,    │
│                lib/finance/, types/, utils/         │
│    must NOT import: components/, hooks/, contexts/, │
│                     app/                            │
└──────────────────────┬──────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────┐
│  lib/auth/   lib/supabase/   lib/finance/           │
│  lib/constants/   lib/validations/                  │
│    may import: types/, utils/                       │
│    must NOT import: anything above this layer       │
└──────────────────────┬──────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────┐
│  types/   utils/                                    │
│    may import: each other (types/ → utils/ allowed) │
│    must NOT import: anything else                   │
└─────────────────────────────────────────────────────┘
```

---

## Module Reference

---

### `app/`

**Path:** `src/app/`

**Responsibility:** Next.js App Router entry points — pages, layouts, route groups, and API handlers. This is the top of the dependency tree.

**Contains:**
- `(auth)/` — Public routes: login, OAuth callback
- `(main)/` — Authenticated routes: home, finance, schedule, profile
- `api/` — Next.js API route handlers (weather, seed)
- `design-system/` — Internal UI preview/playground pages
- `layout.tsx` — Root layout (fonts, providers)
- `Providers.tsx` — Client-side provider tree (QueryClient, theme, etc.)
- `globals.css` — Tailwind base + CSS variable theme definitions

**May import from:** Everything.

**Must NOT be imported by:** Any other module. Pages are leaf nodes — nothing imports from `app/`.

---

### `components/`

**Path:** `src/components/`

**Responsibility:** All React UI — shadcn primitives, feature components, modals, shared widgets, and navigation.

**Sub-modules:**

| Folder | Purpose |
|---|---|
| `ui/` | shadcn/ui primitives — **do not modify directly** |
| `Home/` | Home dashboard widgets and sections |
| `Expenses/` | Expense tracking UI (tables, cards, filters) |
| `Schedule/` | Planner / schedule feature UI |
| `Profile/` | User profile UI |
| `Navbar/` | Navigation bar components |
| `Modals/` | Modal compositions (AddTransaction, AddWallet, etc.) |
| `Shared/` | Cross-feature reusable components |

**May import from:** `components/ui/`, `hooks/`, `contexts/`, `lib/actions/`, `lib/services/`, `lib/constants/`, `lib/validations/`, `lib/finance/`, `types/`, `utils/`.

**Must NOT import from:** `app/`.

**Rules:**
- Never modify files in `components/ui/` — wrap and extend in `components/Shared/` or the feature folder instead.
- Feature components must not import from other feature folders (e.g., `Expenses/` must not import from `Schedule/`). Use `Shared/` for cross-feature UI.

---

### `hooks/`

**Path:** `src/hooks/`

**Responsibility:** Custom React hooks — encapsulates stateful logic, data subscriptions, and browser API access away from components.

**Current hooks:**

| File | Purpose |
|---|---|
| `useFinanceData.ts` | Fetches and manages finance data via React Query |
| `useCurrencyFilter.ts` | Filters expenses by active currency |
| `useRealTimeSync.ts` | Supabase Realtime channel subscription + invalidation |
| `useGlobalShortcut.ts` | Global keyboard shortcut listener |
| `geoLocation.ts` | Browser geolocation access |
| `syncStore.ts` | Zustand store for sync status UI state |
| `use-mobile.ts` | Detects mobile viewport |

**May import from:** `lib/services/`, `lib/actions/`, `lib/constants/`, `lib/supabase/`, `contexts/`, `types/`, `utils/`.

**Must NOT import from:** `components/`, `app/`.

**Rules:**
- All hooks must be prefixed with `use` (except Zustand stores, which are prefixed with `use` by Zustand convention anyway).
- Hooks that access `window`, `navigator`, or other browser APIs must include `"use client"` or only be called inside Client Components.
- Always clean up subscriptions and timers in `useEffect` return functions.

---

### `contexts/`

**Path:** `src/contexts/`

**Responsibility:** React Context providers for narrow, tree-scoped state that needs to be shared across a component subtree without prop drilling.

**Current contexts:**

| File | Purpose |
|---|---|
| `SyncStatusContext.tsx` | Tracks whether a background sync is in progress |

**May import from:** `types/`, `utils/`.

**Must NOT import from:** `components/`, `hooks/`, `lib/`, `app/`.

**Rules:**
- One context per file.
- Every context file exports exactly three things: the Context object, the Provider component, and a custom `use*` hook.
- Context is for **low-frequency, tree-scoped state** (e.g., sync indicator, theme override). Do not use it for server-fetched data or frequently-updating values.

---

### `lib/actions/`

**Path:** `src/lib/actions/`

**Responsibility:** Next.js Server Actions — the write layer. Handles all mutations: insert, update, delete. Every file starts with `"use server"`.

**Current actions:**

| File | Purpose |
|---|---|
| `transactions/index.ts` | Transaction CRUD (add, edit, delete, transfer) |
| `daily-notes.ts` | Daily notes read/write |
| `financeData.ts` | Finance-wide mutations |
| `quick-add.ts` | Quick-add task shortcut |
| `edit-task.ts` | Task editing |
| `remove-task.ts` | Task deletion |
| `toggleTasks.ts` | Task completion toggle |
| `seed.ts` | Database seed action (dev only) |

**May import from:** `lib/auth/`, `lib/supabase/`, `lib/constants/`, `lib/validations/`, `lib/finance/`, `types/`, `utils/`.

**Must NOT import from:** `components/`, `hooks/`, `contexts/`, `app/`, or other `lib/actions/` files.

**Rules:**
- Every action must call `getUser()` before any DB operation — no exceptions.
- Actions must not call other Server Actions. Extract shared logic into a plain function in `lib/services/` or `lib/finance/` instead.
- Always call `updateTag()` after successful mutations to invalidate the Next.js cache.
- Always return `{ success: boolean, message?: string, error?: string, data?: T }`.

---

### `lib/services/`

**Path:** `src/lib/services/`

**Responsibility:** The read layer — data-fetching functions used by both Server Components (in `page.tsx`) and React Query (in Client Components via `useQuery`).

**Current services:**

| File | Purpose |
|---|---|
| `financeData.ts` | Finance-wide queries (wallets, transactions, categories) |

**May import from:** `lib/auth/`, `lib/supabase/`, `lib/constants/`, `lib/finance/`, `types/`, `utils/`.

**Must NOT import from:** `components/`, `hooks/`, `contexts/`, `lib/actions/`, `app/`.

**Rules:**
- Service functions that run on the server should use the `"use cache"` directive with `cacheTag()` and `cacheLife()`.
- Service functions must be pure data-fetching — no side effects, no mutations.
- The same service function should be callable from both a Server Component and a `useQuery` `queryFn`.

---

### `lib/auth/`

**Path:** `src/lib/auth/`

**Responsibility:** Auth utilities — reading the current session and user from Supabase SSR cookies.

**May import from:** `lib/supabase/`, `types/`, `utils/`.

**Must NOT import from:** Anything above this layer.

**Rules:**
- `getUser()` is the single auth utility. Always use this — never call `supabase.auth.getUser()` directly in pages or actions.

---

### `lib/supabase/`

**Path:** `src/lib/supabase/`

**Responsibility:** Supabase client factories — browser client, server client, and admin client.

**May import from:** `types/`, `utils/`.

**Must NOT import from:** Anything above this layer.

**Rules:**
- Use the **browser client** for Client Components.
- Use the **server client** for Server Components and Server Actions that need the user's session.
- Use the **admin client** (service role) only in Server Actions where you need to bypass RLS. Never expose the admin client to the browser.

---

### `lib/constants/`

**Path:** `src/lib/constants/`

**Responsibility:** App-wide static values — delays, limits, regex patterns, option arrays, and styling maps.

**May import from:** `types/`, `utils/`.

**Must NOT import from:** Anything above this layer.

**Rules:**
- Use `UPPER_SNAKE_CASE` for primitive values, regexes, and static arrays.
- Use `camelCase` for complex config/styling objects (e.g., `WALLET_STYLES`).
- Use `as const` for option arrays to preserve literal types.
- Do **not** use `src/config/constants/` — that directory is unused. All constants belong here.

---

### `lib/validations/`

**Path:** `src/lib/validations/`

**Responsibility:** Shared Zod schemas used across multiple features (auth forms, common field patterns).

**May import from:** `types/`, `utils/`.

**Must NOT import from:** Anything above this layer.

**Rules:**
- Feature-specific schemas that are only used in one component can live alongside that component (e.g., `components/Modals/AddTransaction/schemas.ts`).
- Auth and global schemas always live here.
- Export schemas as named camelCase constants with a `Schema` suffix (e.g., `expenseSchema`).
- Always derive TypeScript types with `z.infer` — never duplicate type definitions by hand.

---

### `lib/finance/`

**Path:** `src/lib/finance/`

**Responsibility:** Pure finance domain logic — formatting, calculations, and parsing. No I/O, no React, no side effects.

**May import from:** `types/`, `utils/`.

**Must NOT import from:** Anything above this layer.

**Rules:**
- All functions must be pure (same input → same output, no side effects).
- No Supabase calls, no React hooks, no browser APIs.

---

### `types/`

**Path:** `src/types/`

**Responsibility:** All shared TypeScript types and interfaces, grouped by domain.

**Current files:**

| File | Purpose |
|---|---|
| `database.ts` | Auto-generated Supabase types — **do not edit manually** |
| `expenses.ts` | Derived expense/transaction types |
| `dashboard.ts` | Dashboard-level types |
| `weather.ts` | Weather API types |

**May import from:** `utils/` (sparingly, for type-level utilities only).

**Must NOT import from:** Anything else.

**Rules:**
- `database.ts` is auto-generated — never edit it manually. Run the Supabase CLI to regenerate.
- Derive domain types from `database.ts` using `Pick`, `Omit`, and `&` — do not duplicate fields.
- Use `interface` for object shapes, `type` for unions, intersections, and utility types.

---

### `utils/`

**Path:** `src/utils/`

**Responsibility:** Pure utility functions with no framework dependencies — string manipulation, date formatting, color helpers, parsing.

**Current files:**

| File | Purpose |
|---|---|
| `currency.ts` | Currency formatting helpers |
| `financial.ts` | Financial calculation utilities |
| `color.ts` | Color manipulation utilities |
| `timezone.ts` | Timezone conversion helpers |
| `daily-brief.ts` | Daily brief text helpers |
| `weather-utils.ts` | Weather data formatting |
| `parseTaskLines.ts` | Task string parsing |

**May import from:** `types/`.

**Must NOT import from:** Anything else — no React, no Supabase, no Next.js.

**Rules:**
- All functions must be pure.
- No side effects, no I/O, no browser APIs.
- Do not confuse `utils/` (pure functions) with `lib/` (framework-integrated logic). If it touches Supabase, Next.js, or React, it belongs in `lib/`, not `utils/`.

---

## Forbidden Patterns

| Pattern | Why It's Forbidden |
|---|---|
| `lib/services/` importing from `components/` | Creates a circular dependency — services are below components in the stack |
| `lib/actions/` importing from another `lib/actions/` file | Server Actions are HTTP entry points; chain plain functions instead |
| `types/` importing from `lib/` or `components/` | Types are the lowest layer — they must not depend on anything above |
| `utils/` importing from `lib/` | Same reason — utils must stay pure and framework-free |
| Any module importing from `app/` | Pages are leaf nodes; nothing imports from them |
| `components/Expenses/` importing from `components/Schedule/` | Feature modules must not cross-import; use `components/Shared/` instead |
| Using `src/config/` | This directory is unused — use `src/lib/constants/` instead |
| Importing the Supabase admin client in a Client Component | The service role key must never reach the browser |
