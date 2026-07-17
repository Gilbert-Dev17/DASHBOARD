import PageComponent from "@/components/shared/PageComponent";
import { Loader2 } from "lucide-react";

export default function Loading() {
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
          Loading...
        </p>
      </div>
    </PageComponent>
  );
}
