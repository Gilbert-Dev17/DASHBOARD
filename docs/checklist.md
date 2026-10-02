# DASHBOARD Checklist

Source: `docs/NOTES.MD` + `PLAN.md`, checked against the code on 2026-10-03.

Legend: `[ ]` not done, `[x]` done and verified, `[?]` could not verify from code, needs manual repro.

## Fix / Bug

- [ ] Task added on a later date lands on today. Partly fixed: `QuickAddModal` reads `?date=` and `submitQuickAddTasks` accepts `targetDate`. It still falls back to today on any page without `?date=` (Home, Finance, Navbar quick-add).
- [ ] QuickAdd must show which date the tasks go to (label). Not in `QuickAddModal.tsx`.
- [ ] "Free" task (no date) concept. Needs a design decision first, no code yet.
- [?] Add Category modal too zoomed, cannot add a category. `AddCategoryModal` uses `ResponsiveDialog`; repro on mobile.
- [?] Mobile layout not fitting.
- [ ] Skeleton for JournalSection. There is no `JournalSection.tsx`; the journal lives in `NotesSection.tsx` and shows a `Spinner` while loading.
- [ ] Auto-height for long subtask text. `ui/textarea.tsx` has `field-sizing-content`; subtask inputs in `AgendaSection` / `UpdateTaskModal` not confirmed to use it.
- [ ] Add Wallet page header says "Add Category" (`src/app/(main)/finance/add/wallet/page.tsx:14`).
- [x] `updateTag` typo in `toggleTasks.ts` is fixed (`planner-tasks-${id}`).
- [ ] Remove stray `console.log`: `schedule/action.ts:162`, `finance/accounts/[accountId]/action.ts:39`, `api/weather/route.ts:66`, `lib/actions/toggleTasks.ts:17`.
- [ ] `api/seed/route.ts` has no auth or `NODE_ENV` guard.
- [ ] `WalletCard.tsx:66` uses `text-red-400`; the rest of the app uses `text-rose-500`.
- [ ] `.env.example` is missing `OPENWEATHER_API_KEY` and still lists a stale `ANON_KEY`.

## Add (from NOTES.MD)

- [x] One shared button + spinner component: `Shared/LoadingButton.tsx`, documented in `ARCHITECTURE.md`. Applied to QuickAdd, Income/Expense/Transfer/Bulk forms, UpdateTask, NotesSection save. `AlertDialogAction` in `DeleteTaskModal` left as is (`asChild`, and the file is dead code).
- [ ] Rich text for journal notes, stored as JSON. No editor dependency installed; `daily_notes.content` is plain text.
- [ ] Skeleton loading state for NotesSection. A spinner exists, no skeleton.
- [ ] Store timezone codename in the DB for the snapshot cron job. `utils/timezone.ts` hardcodes `Asia/Manila`; no cron or timezone column in code.
- [ ] Supabase migration files. No `supabase/` dir.
- [ ] Prisma (maybe). Not installed. Decide yes/no first.
- [ ] `docs/code-structure.md` + local dev reference. Missing.
- [x] Architecture / conventions docs: `ARCHITECTURE.md`, `CONVENTIONS.md`, `DATAFLOW.md`, `MODULES.md`, `ANTIPATTERNS.md` exist.
- [ ] Docs for DASHBOARD notes / update progress (changelog style).
- [ ] Apply the `tarsi.recovery.json` file. Not found in the repo or home dir; locate it first.

## Need (features)

- [ ] Detailed view per category (`finance/categories/[categoryId]`). Missing.
- [ ] Edit category: `EditCategoryModal`, `update-category.ts`. Missing.
- [ ] Delete category: modal + `delete-category.ts`. Missing.
- [ ] Edit transaction: `EditTransactionModal`, `update-transaction.ts`. Missing.
- [ ] Budget tracker (`budgets` table, actions, modal, page). Missing.
- [ ] Recurring payments tracker (table, modal, page, daily cron). Missing.
- [ ] Redesign graphs into square-block trackers. Not started.

## Dead code (PLAN.md week 1, still present)

- [ ] Delete `components/Home/NetWorthOverview.tsx`
- [ ] Delete `components/Home/WeatherCard.tsx` + `WeatherCardSkeleton.tsx` (check `GreetingHeader` imports first)
- [ ] Delete `components/Navbar/Navbar.tsx`
- [ ] Delete `task-deleteModal/DeleteTaskModal.tsx`
- [ ] Delete `components/Schedule/MobileScheduleCalendar.tsx` and the dead branch in `schedule/client.tsx` (`CustomC = true`)
- [ ] Delete `finance/viewAllAccounts/[accountId]/` (duplicate of `accounts/[accountId]/`), fix links
- [ ] Delete `lib/graphqlClient.ts`; remove `graphql` and `graphql-request` from `package.json`
- [ ] Remove `motion` from `package.json` if still unused
- [x] `SyncStatusContext` and `.gitkeep` removed (commit a384297)

## PLAN.md later sprints (not started)

- [ ] Analytics page (`finance/analytics`, `utils/analytics.ts`)
- [ ] Task templates
- [ ] CSV export (`api/export/route.ts`)
- [ ] Profile edit, avatar upload, account delete
- [ ] PWA (`public/manifest.json`, service worker)
- [ ] Realtime filters by `user_id`
- [ ] More tests. Only 3 test files today: `FullCalendar`, `NotesSection`, `withAuth`.
