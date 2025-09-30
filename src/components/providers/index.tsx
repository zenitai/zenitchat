import type { ReactNode } from "react";
import { ThemeProvider } from "@/components/theme/provider";
import { ConvexClientProvider } from "./convex-provider";
import { ConvexQueryCacheProvider } from "convex-helpers/react/cache/provider";

export default function RootProviders({ children }: { children: ReactNode }) {
  return (
    <ConvexClientProvider>
      <ConvexQueryCacheProvider>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </ConvexQueryCacheProvider>
    </ConvexClientProvider>
  );
}
