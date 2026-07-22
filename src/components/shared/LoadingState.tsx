'use client'

import { usePathname, useParams } from 'next/navigation';
import { Loader2 } from "lucide-react";
import PageComponent from "@/components/shared/PageComponent";

export default function LoadingState() {
  const pathname = usePathname();
  const params = useParams();

  // Dynamically determine what we are loading based on the URL
  const routeLabels = [
    { match: '/viewAllAccounts', label: "Loading Wallets..." },
    { match: '/viewAllCategories', label: "Loading Categories..." },
    { match: '/viewAll', label: "Loading Transactions..." },
    { match: '/accounts/', condition: !!params?.accountId, label: "Loading Account Statement..." },
    { match: '/home', label: "Loading Home..." },
    { match: '/schedule', label: "Loading Planner..." },
    { match: '/profile', label: "Loading Profile..." },
    { match: '/finance', label: "Loading Finance..." },
  ];

  const matchedRoute = pathname
    ? routeLabels.find(route =>
        pathname.includes(route.match) && (route.condition !== false)
      )
    : null;

  const loadingText = matchedRoute?.label || "Loading...";

  return (
    <PageComponent>
      <div className="flex-1 flex flex-col items-center justify-center min-h-[60vh] gap-6 animate-in fade-in duration-700 shimmer">
        <div className="relative flex items-center justify-center">
          {/* Outer subtle glowing pulse behind the spinner */}
          <div className="absolute inset-0 rounded-full blur-xl bg-primary/20 animate-pulse scale-150" />

          {/* Inner elegant spinner */}
          <Loader2 className="h-8 w-8 animate-spin text-primary relative z-10" strokeWidth={1.5} />
        </div>

        <p className="text-sm tracking-wide text-muted-foreground/80 font-medium animate-pulse">
          {loadingText}
        </p>
      </div>
    </PageComponent>
  );
}
