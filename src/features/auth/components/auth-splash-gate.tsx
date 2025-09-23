import { Loader2 } from "lucide-react";
import { useLocation, matchPath } from "react-router";
import { BorderBeam } from "@/components/ui/border-beam";
import { useIsLoading, useIsAuthenticated, useIsInitialized } from "../store";

interface AuthSplashGateProps {
  children: React.ReactNode;
}

const AUTH_ROUTES = [
  "/login",
  "/signup",
  "/forgot-password",
  "/reset-password",
] as const;

export function AuthSplashGate({ children }: AuthSplashGateProps) {
  const isLoading = useIsLoading();
  const isAuthenticated = useIsAuthenticated();
  const isInitialized = useIsInitialized();
  const location = useLocation();

  const isAuthRoute = AUTH_ROUTES.some((route) =>
    matchPath({ path: route, end: false }, location.pathname),
  );
  const shouldShowSplash =
    (isLoading || !isInitialized) && !(isAuthRoute && !isAuthenticated);

  // Show splash screen while loading (but not on auth routes for unauthenticated users)
  if (shouldShowSplash) {
    return (
      <div className="fixed inset-0 z-50 grid grid-cols-3 grid-rows-3 bg-background">
        {/* Row 1 */}
        <div className="border-r border-b"></div>
        <div className="border-r border-b"></div>
        <div className="border-b"></div>

        {/* Row 2 */}
        <div className="border-r border-b"></div>
        {/* Center cell - Content */}
        <div className="border-r border-b flex items-center justify-center relative">
          <div
            className="flex flex-col items-center gap-3"
            role="status"
            aria-live="polite"
            aria-atomic="true"
          >
            <Loader2
              className="h-8 w-8 animate-spin text-primary"
              style={{ animationDuration: "0.5s" }}
              aria-hidden="true"
            />
          </div>
          <BorderBeam
            size={70}
            duration={2.5}
            colorFrom="#ffaa40"
            colorTo="#9c40ff"
            borderWidth={2}
          />
        </div>
        <div className="border-b"></div>

        {/* Row 3 */}
        <div className="border-r"></div>
        <div className="border-r"></div>
        <div></div>
      </div>
    );
  }

  // Show children when auth check is complete
  return <>{children}</>;
}
