import { ThemeProvider } from "@/components/theme/provider";
import { ConvexClientProvider } from "./convex-provider";

export default function RootProviders({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ConvexClientProvider>
      <ThemeProvider
        attribute="class"
        defaultTheme="dark"
        enableSystem
        disableTransitionOnChange
      >
        {children}
      </ThemeProvider>
    </ConvexClientProvider>
  );
}
