# Personal Dashboard

An ultra-modern, typography-driven personal dashboard built with **Next.js 16**, **Supabase**, **Tailwind CSS 4**, and **shadcn/ui**. Designed with a focus on deep minimalism, glassmorphism, and a seamless dual-floating navigation architecture.

## Features

### Core Modules

- **Dynamic Home** — Intelligent daily briefings that generate natural-language summaries based on your schedule, tasks, and time of day. Displays real-time weather data via geolocation, life progress bars (day/week/month/year), and pending task counts.

- **Planner & Agenda** — A full-featured calendar planner with month and week views, nested subtasks, NLP-powered quick-add (`@category 10:00am` syntax), daily journal notes with debounced autosave, and optimistic UI updates with undo support.

- **Finance** — Comprehensive net worth tracking with multi-currency support, interactive 30-day trend sparklines, income vs. expense breakdowns, category-based spending analysis with donut charts, wallet management (Debit, Assets, Stocks, Crypto, Credit, Loans), fund transfers, balance adjustments, bulk expense entry, and full transaction history with grouped time-based filtering.

- **Profile & Settings** — Google OAuth account management, theme toggle with View Transitions API crossfade, default currency preference, and Supabase database metrics dashboard (storage usage, table row counts).

### Design & Architecture

- **Dual-Floating Navigation** — Glassmorphic sidebar dock (desktop) and bottom floating bar (mobile) with context-aware quick-add buttons, real-time sync indicator, and theme toggle.
- **Dark Mode Native** — Fully integrated light/dark themes using `next-themes` with 500ms crossfade transitions and carefully balanced contrast ratios.
- **Real-Time Sync** — Supabase Realtime subscriptions across all data tables with visual sync status indicator and automatic midnight date rollover.
- **Optimistic UI** — Instant feedback on task toggles, deletions, and edits with 5-second undo toasts and animated countdown bars.
- **Server-Side Caching** — Next.js `'use cache'` directives with granular cache tags and `revalidateTag` for targeted invalidation.

## Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | [Next.js 16](https://nextjs.org/) (App Router, Server Actions, `'use cache'`) |
| **Language** | [TypeScript 7](https://www.typescriptlang.org/) |
| **Database & Auth** | [Supabase](https://supabase.com/) (Postgres, Auth, Realtime, SSR) |
| **Styling** | [Tailwind CSS 4](https://tailwindcss.com/) |
| **UI Components** | [shadcn/ui](https://ui.shadcn.com/), [Radix UI](https://www.radix-ui.com/), [Base UI](https://base-ui.com/) |
| **State Management** | [TanStack React Query](https://tanstack.com/query) + [Zustand](https://zustand.docs.pmnd.rs/) |
| **Charts** | [Recharts](https://recharts.org/) |
| **Forms & Validation** | [React Hook Form](https://react-hook-form.com/) + [Zod](https://zod.dev/) |
| **Icons** | [Lucide React](https://lucide.dev/) |
| **Date Utilities** | [date-fns](https://date-fns.org/) |
| **Testing** | [Vitest](https://vitest.dev/) + [Testing Library](https://testing-library.com/) |
| **Package Manager** | [pnpm](https://pnpm.io/) |
| **Deployment** | [Vercel](https://vercel.com/) |

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm
- A [Supabase](https://supabase.com/) project

### Environment Setup

Copy the example environment file and fill in your Supabase credentials:

```bash
cp .env.example .env.local
```

Required variables:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_supabase_publishable_key
NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_SUPABASE_JWT_SECRET=your_supabase_jwt_secret
OPENWEATHER_API_KEY=your_openweather_api_key  # Optional, for weather widget
```

### Install & Run

```bash
# Install dependencies
pnpm install

# Start the development server
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

### Other Commands

```bash
pnpm build      # Production build
pnpm start      # Start production server
pnpm lint       # Run ESLint
pnpm vitest     # Run tests
```

## Project Structure

```
src/
├── app/
│   ├── (auth)/              # Login & OAuth callback routes
│   ├── (main)/
│   │   ├── home/            # Dashboard landing page
│   │   ├── schedule/        # Calendar planner & agenda
│   │   ├── finance/         # Finance dashboard & sub-routes
│   │   │   ├── accounts/    # Individual account statements
│   │   │   ├── add/         # Add transaction/wallet/category forms
│   │   │   ├── transaction-history/  # Full transaction ledger
│   │   │   ├── viewAllAccounts/      # All wallets grid
│   │   │   └── viewAllCategories/    # All categories grid
│   │   └── profile/         # User settings & DB metrics
│   └── api/                 # API routes (weather, seed)
├── components/
│   ├── Expenses/            # Finance-specific components
│   ├── Home/                # Home page components
│   ├── Modals/              # All modal dialogs (CRUD operations)
│   ├── Navbar/              # Sidebar & mobile navigation
│   ├── Profile/             # Profile & settings components
│   ├── Schedule/            # FullCalendar planner
│   ├── Shared/              # Reusable cross-module components
│   └── ui/                  # shadcn/ui primitives
├── contexts/                # React context providers
├── hooks/                   # Custom hooks (sync, currency, geolocation)
├── lib/
│   ├── actions/             # Server actions (tasks, transactions, notes)
│   ├── auth/                # Auth utilities
│   ├── constants/           # App constants & options
│   ├── finance/             # Financial calculation utilities
│   ├── supabase/            # Supabase client configurations
│   └── validations/         # Zod schemas
├── types/                   # TypeScript type definitions
└── utils/                   # Shared utilities (currency, daily brief, weather)
```

## Database Schema

The app uses 9 Supabase Postgres tables:

| Table | Purpose |
|---|---|
| `profiles` | User profile data & preferences |
| `tasks` | Scheduled tasks assigned to calendar dates |
| `subtasks` | Checklist items within tasks |
| `task_categories` | Custom task categories |
| `daily_notes` | Journal entries per date |
| `wallets` | Financial accounts (assets & liabilities) |
| `wallet_snapshots` | Historical balance snapshots for trends |
| `transactions` | Income, expense, transfer & adjustment records |
| `expense_categories` | Spending categories with icons & colors |

## License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.
