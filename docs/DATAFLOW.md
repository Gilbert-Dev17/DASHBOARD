# Data Flow

> How data moves through the **DASHBOARD** codebase.
> Use this as a reference when deciding where to fetch, mutate, cache, and revalidate data.

---

## Table of Contents

- [Overview](#overview)
- [Read Path — Server Components](#read-path--server-components)
- [Read Path — Client Components](#read-path--client-components)
- [Write Path — Server Actions](#write-path--server-actions)
- [Write Path — Client Mutations](#write-path--client-mutations)
- [Caching Strategy](#caching-strategy)
- [Real-Time Sync](#real-time-sync)
- [Auth Flow](#auth-flow)
- [Decision Guide](#decision-guide)

---

## Overview

```
┌─────────────────────────────────────────────────────────────┐
│                        Browser                              │
│                                                             │
│  Client Component                                           │
│  ┌──────────────────────────────────────────────┐           │
│  │  React Query (useQuery / useMutation)        │           │
│  │        │                   │                 │           │
│  │  lib/services/     lib/actions/              │           │
│  │  (reads)           (mutations)               │           │
│  └──────────┬─────────────────┬────────────────┘           │
│             │                 │                             │
└─────────────┼─────────────────┼─────────────────────────────┘
              │                 │
┌─────────────▼─────────────────▼─────────────────────────────┐
│                        Server                               │
│                                                             │
│  Server Component                                           │
│  ┌──────────────────────────────────────────────┐           │
│  │  lib/services/ (fetch)  →  RSC render        │           │
│  │  page.tsx → client.tsx (props)               │           │
│  └──────────────────────┬───────────────────────┘           │
│                         │                                   │
│  ┌──────────────────────▼───────────────────────┐           │
│  │  Supabase DB  │  GraphQL API                 │           │
│  └──────────────────────────────────────────────┘           │
└─────────────────────────────────────────────────────────────┘
```

---

## Read Path — Server Components

Used for **initial page data** that doesn't need interactivity.

```
page.tsx (async Server Component)
  │
  ├── getUser()                   ← auth guard (redirect if unauthenticated)
  │
  ├── Promise.all([               ← parallel data fetching
  │     fetchWallets(user.id),
  │     fetchExpenses(user.id),
  │   ])
  │         │
  │     lib/services/             ← service functions (use "use cache")
  │         │
  │     Supabase Admin / GraphQL  ← data source
  │
  └── <ClientPage initialData={data} />   ← pass as props to client wrapper
```

**Rules:**
- Auth guard **always** runs first — never fetch data before verifying the user.
- Use `Promise.all` for parallel, independent fetches.
- Service functions use the `"use cache"` directive with `cacheTag()` + `cacheLife()`.
- Pass fetched data to `client.tsx` as `initial*` props for hydration.

---

## Read Path — Client Components

Used for **interactive, user-driven, or frequently refreshed data**.

```
Client Component
  │
  useQuery({
    queryKey: ["expenses", userId, filters],
    queryFn: () => fetchExpenses(userId, filters),   ← lib/services/
    initialData: initialExpenses,                   ← from page.tsx props
  })
  │
  lib/services/expenseService.ts
  │
  Supabase Browser Client / GraphQL
```

**Rules:**
- Always pass `initialData` from the server to avoid a loading flash on first render.
- `queryKey` must include all variables the query depends on (user ID, filters, etc.).
- Use `staleTime` to prevent unnecessary refetches for slow-changing data.
- Never fetch inside `useEffect` — always use React Query.

---

## Write Path — Server Actions

Used for **form submissions and mutations triggered from Server Components** or React Query mutations.

```
User interaction (form submit / button)
  │
  React Hook Form (handleSubmit)
  │
  Server Action (lib/actions/add-expense.ts)
  │
  ├── getUser()                  ← auth guard
  ├── Zod validation (schema)    ← validate input server-side
  ├── supabaseAdmin mutation     ← write to DB
  ├── updateTag(`expenses-${userId}`)  ← invalidate Next.js cache
  └── return { success, message, error }
```

**Rules:**
- Every action starts with `"use server"`.
- Auth guard runs before any DB operation.
- Always validate with Zod server-side — never trust client input.
- Always return `{ success: boolean, message?: string, error?: string, data?: T }`.
- Call `updateTag()` to invalidate the relevant cache after every successful mutation.

---

## Write Path — Client Mutations

Used for **optimistic updates and mutations triggered from Client Components** via React Query.

```
User interaction
  │
  useMutation({
    mutationFn: (data) => addExpenseAction(data),   ← Server Action
    onMutate: async (data) => {                     ← optimistic update
      await queryClient.cancelQueries(["expenses"])
      const prev = queryClient.getQueryData(["expenses"])
      queryClient.setQueryData(["expenses"], old => [...old, data])
      return { prev }
    },
    onError: (err, data, ctx) => {
      queryClient.setQueryData(["expenses"], ctx.prev)   ← rollback
    },
    onSettled: () => {
      queryClient.invalidateQueries(["expenses"])         ← refetch
    },
  })
```

**Rules:**
- Use `onMutate` + `onError` rollback for optimistic updates on list mutations.
- Always call `invalidateQueries` in `onSettled` to sync with the server.
- Toast notifications (Sonner) are called inside `onSuccess` / `onError`.

---

## Caching Strategy

| Layer | Mechanism | Invalidation |
|---|---|---|
| **Next.js RSC cache** | `"use cache"` + `cacheTag()` + `cacheLife()` | `updateTag()` from Server Action |
| **React Query cache** | `useQuery` with `queryKey` + `staleTime` | `invalidateQueries()` in `onSettled` |
| **Supabase** | No client-side cache — raw DB reads | N/A |

```
Server Action mutation
  ├── updateTag("expenses-userId")        ← busts Next.js page cache
  └── React Query invalidateQueries(...)  ← busts client cache → refetch
```

---

## Real-Time Sync

Real-time updates use **Supabase Realtime channels** inside custom hooks.

```
useRealTimeSync (custom hook)
  │
  supabase.channel("expenses")
    .on("postgres_changes", { event: "*", table: "transactions" }, payload => {
      queryClient.invalidateQueries(["expenses", userId])
    })
    .subscribe()
  │
  Cleanup: supabase.removeChannel(channel)   ← always in useEffect cleanup
```

**Rules:**
- Always unsubscribe from channels in the `useEffect` cleanup function.
- Sync status is tracked via `SyncStatusContext` (`isSyncing` state).
- Only invalidate the specific query keys affected by the change.

---

## Auth Flow

```
Browser request to (main) route
  │
  page.tsx
  │
  getUser()                       ← reads Supabase session (SSR cookie)
  │
  ├── No session → redirect("/login")
  └── Session valid
        │
        └── proceed with data fetching
```

- `getUser()` is the single auth utility — never use `supabase.auth.getUser()` directly in pages.
- Auth state on the client is managed by Supabase SSR helpers via cookies.
- Middleware (if present) handles route-level protection for entire route groups.

---

## Decision Guide

> Use this table when deciding where to put your logic.

| Scenario | Solution |
|---|---|
| Fetch data on page load, no interactivity needed | Server Component + `lib/services/` |
| Data depends on user interaction / filters | `useQuery` in Client Component |
| Submit a form | Server Action via `useMutation` |
| Update UI immediately before server confirms | Optimistic update in `onMutate` |
| Data changes from another user / device | Supabase Realtime → `invalidateQueries` |
| Global client-only UI state (sidebar open, filters) | Zustand |
| Narrow tree-scoped state (sync indicator) | React Context |
| Server-fetched data on the client | React Query — **never** Zustand |
