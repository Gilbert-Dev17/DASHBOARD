"use client";

import React, {useState} from "react";
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { ThemeProvider } from "next-themes";

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'


export default function Providers({ children }: { children: React.ReactNode }) {

  const [queryClient] = useState(
    () =>
      new QueryClient({
      defaultOptions: {
        queries: {
          staleTime: 60_000,
          retry: 1,
        },
      },
    })
  )

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
        {process.env.NODE_ENV === 'development' && <ReactQueryDevtools initialIsOpen={false} />}
        {children}
      </ThemeProvider>
    </QueryClientProvider>
  );
}
