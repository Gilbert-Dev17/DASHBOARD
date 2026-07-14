# Personal Dashboard

An ultra-modern, typography-driven personal dashboard built with **Next.js**, **Tailwind CSS**, and **Shadcn UI**. Designed with a focus on deep minimalism, glassmorphism, and a seamless dual-floating navigation architecture.

## 🚀 Features

### Core Modules
* **Dynamic Home**: Intelligent daily briefings that generate natural-language summaries of your day based on your schedule, tasks, and the time of day.
* **Planner & Agenda**: A robust task manager featuring nested subtasks, timeline scheduling, and completion tracking. 
* **Financial Expenses**: Comprehensive net worth tracking, income vs. expenses analysis, and detailed transaction logs categorized by wallet and type.
* **Profile & Stats**: Centralized hub for user management and high-level productivity/financial statistics.

### Design & Architecture
* **Dual-Floating Navigation**: Features a split navigation system. A sleek, hover-to-expand glassmorphic sidebar handles core routing, while a dedicated top-right utility pill manages quick actions, theming, and profile settings.
* **Premium Aesthetics**: Heavy emphasis on modern typography, dashed structural borders, blurred backdrops (`backdrop-blur-xl`), and smooth micro-animations.
* **Dark Mode Native**: Fully integrated light and dark themes using `next-themes` with carefully balanced contrast ratios.
* **DRY & Modular**: Built with highly reusable components (e.g., custom `<Timeline>`, generic `<Card variant="dashed">`) and centralized mock data abstractions for quick backend integration.

## 🛠️ Tech Stack

* **Framework**: [Next.js](https://nextjs.org/) (App Router)
* **Styling**: [Tailwind CSS](https://tailwindcss.com/)
* **UI Components**: [Shadcn UI](https://ui.shadcn.com/) & [Radix UI](https://www.radix-ui.com/)
* **Icons**: [Lucide React](https://lucide.dev/)
* **Date Parsing**: [date-fns](https://date-fns.org/)

## 💻 Getting Started

First, install the dependencies:

```bash
npm install
# or
yarn install
# or
pnpm install
```

Then, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## 📂 Project Structure

* `/src/app/(main)` - Core dashboard routes (Home, Planner, Expenses, Profile).
* `/src/components/ui` - Reusable Shadcn and custom primitive components (Timeline, Cards).
* `/src/components/navbar` - Dual-floating navigation system (Sidebar, Topbar).
* `/src/lib` - Centralized mock data, schemas, and constant definitions.
* `/src/utils` - Shared logic like timezone detection, daily brief generation, and currency formatting.
