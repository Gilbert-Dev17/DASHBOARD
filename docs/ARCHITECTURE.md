# Architecture

> Architectural guidelines for the **DASHBOARD** codebase.
> Every contributor (human or AI) should follow these conventions.

---

## Tech Stack

| Layer | Technology |
| --- | --- |
| **Framework** | Next.js 16 (App Router, RSC) |
| **Language** | TypeScript 7 (strict mode) |
| **UI Components** | **shadcn/ui** (Radix Nova style) |
| **Styling** | Tailwind CSS v4, CSS variables for theming |
| **Icons** | Lucide React |
| **State Management** | Zustand (client state), React Context (sync status) |
| **Server State** | TanStack React Query v5 |
| **Forms** | React Hook Form + Zod validation |
| **Backend / Auth** | Supabase (Auth, Database, SSR helpers) |
| **Data Fetching** | GraphQL via `graphql-request` |
| **Charts** | Recharts v3 (wrapped with shadcn `<Chart />`) |
| **Animations** | Motion (Framer Motion) |
| **Notifications** | Sonner toast |
| **Testing** | Vitest + Testing Library |
| **Package Manager** | pnpm (workspace) |

---

## UI — Always Use shadcn Components

**shadcn/ui is the single source of truth for all UI primitives in this project.**

### Rules

1. **Never build a primitive from scratch** — If shadcn already ships a component (Button, Dialog, Select, Table, Card, Tabs, etc.), use it. Check `src/components/ui/` first.
2. **Add new shadcn components via the CLI** — `pnpm dlx shadcn@latest add <component>`. This keeps the components in sync with the registry.
3. **Extend, don't fork** — If a shadcn component needs custom behavior, wrap it in a new component under `src/components/` and compose the shadcn primitive inside. Do not modify files in `src/components/ui/` unless absolutely necessary.
4. **Use the `cn()` utility** for conditional class merging (`@/lib/utils`).
5. **Use CSS variables** for theming — colors are defined in `src/app/globals.css`. Do not hard-code color values.
6. **Icons come from Lucide** — import from `lucide-react`. Do not mix icon libraries.

### Currently Installed shadcn Components

Accordion · Alert Dialog · Avatar · Badge · Button · Calendar · Card · Carousel · Chart · Checkbox · Collapsible · Command · Dialog · Drawer · Dropdown Menu · Empty · Field · Input · Input Group · Input OTP · Kbd · Label · Native Select · Pagination · Popover · Progress · Responsive Dialog · Scroll Area · Select · Separator · Skeleton · Sonner · Spinner · Switch · Table · Tabs · Textarea · Timeline · Tooltip

---

## Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── (auth)/             # Auth route group (login, signup)
│   ├── (main)/             # Authenticated route group (dashboard pages)
│   ├── api/                # API route handlers
│   ├── design-system/      # Design system preview pages
│   ├── layout.tsx          # Root layout
│   ├── Providers.tsx       # Client providers (QueryClient, Theme, etc.)
│   └── globals.css         # Tailwind + CSS variable theme
│
├── components/
│   ├── ui/                 # shadcn/ui primitives (DO NOT modify lightly)
│   ├── Home/               # Home / dashboard feature components
│   ├── Expenses/           # Expense tracking feature components
│   ├── Schedule/           # Schedule feature components
│   ├── Profile/            # Profile feature components
│   ├── Navbar/             # Navigation components
│   ├── Modals/             # Modal compositions
│   └── Shared/             # Cross-feature reusable components
│
├── hooks/                  # Custom React hooks
├── contexts/               # React Context providers
├── lib/
│   ├── supabase/           # Supabase client (browser + server)
│   ├── services/           # Data-fetching service functions
│   ├── actions/            # Server Actions
│   ├── constants/          # App-wide constants
│   ├── validations/        # Zod schemas
│   ├── finance/            # Finance domain helpers
│   ├── graphqlClient.ts    # GraphQL client setup
│   └── utils.ts            # cn() and shared utilities
│
├── types/                  # Shared TypeScript types & interfaces
├── utils/                  # Pure utility functions
└── __tests__/              # Test files
```

---

## Key Conventions

### Routing

- Use **route groups** `(auth)` and `(main)` to separate public and authenticated layouts.
- Prefer **Server Components** by default; add `"use client"` only when interactivity or browser APIs are required.

### Data Flow

```
Server Component → lib/services (fetch) → RSC render
Client Component → React Query (useQuery/useMutation) → lib/services → Supabase / GraphQL
```

- **Server Actions** live in `lib/actions/` and are used for mutations from Server Components.
- **React Query** handles client-side caching, optimistic updates, and real-time sync.

### State Management

- **Zustand** for client-only global state (e.g., UI toggles, filters).
- **React Context** for narrow, tree-scoped state (e.g., sync status).
- **Do not** use Zustand for server-fetched data — that belongs in React Query.

### Forms & Validation

- Every form uses **React Hook Form**.
- Every schema uses **Zod**. Schemas live in `lib/validations/`.
- Connect them with `@hookform/resolvers/zod`.

### Styling

- Tailwind utility classes are the primary styling mechanism.
- Use `tailwind-merge` (via `cn()`) to merge classes without conflicts.
- Animations use the `motion` library or `tw-animate-css`.

### Testing

- Unit / integration tests use **Vitest** + **Testing Library**.
- Test files live in `src/__tests__/` and **must mirror the source folder structure** for easy searching. The path to a test should match the path to the file it covers:

```
src/
├── components/
│   └── Expenses/
│       └── ExpenseTable.tsx
├── hooks/
│   └── useCurrencyFilter.ts
├── lib/
│   └── services/
│       └── expenseService.ts
└── __tests__/
    ├── components/
    │   └── Expenses/
    │       └── ExpenseTable.test.tsx   ← mirrors components/Expenses/
    ├── hooks/
    │   └── useCurrencyFilter.test.ts   ← mirrors hooks/
    └── lib/
        └── services/
            └── expenseService.test.ts  ← mirrors lib/services/
```

- **Do not** dump all tests into a flat `__tests__/` directory — always recreate the nested folder path so you can locate a test by navigating the same structure as the source.

---

## Adding a New Feature

1. Create a route under `src/app/(main)/feature-name/`.
2. Build feature components in `src/components/FeatureName/`.
3. Compose UI from **shadcn components** in `src/components/ui/`.
4. Add types to `src/types/`.
5. Add Zod schemas to `src/lib/validations/`.
6. Add service functions to `src/lib/services/`.
7. Add server actions (if needed) to `src/lib/actions/`.
8. Write tests in `src/__tests__/`.
