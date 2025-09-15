import { SidebarFooter } from "@/components/ui/sidebar";
import { Link } from "react-router";
import { useAuth } from "@/features/auth";
// import { useQuery } from "convex/react";
// import { api } from "@/convex/_generated/api";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { AuthCard } from "./auth-card-sidebar-footer";

export function AppSidebarFooter() {
  const {
    isAuthenticated,
    unAuthedNewUser,
    unAuthedReturningUser,
    markAsVisited,
  } = useAuth();

  // const user = useQuery(api.auth.getCurrentUser);
  // const isLoading = user === undefined;
  // const displayName = user?.name || "";
  // const imageUrl = (user as { image?: string } | null)?.image ?? undefined;
  // const initial = isLoading ? "" : displayName.charAt(0)?.toUpperCase() || "U";

  // Hardcoded for now
  const displayName = "User";
  const imageUrl = undefined;
  const initial = "U";

  return (
    <SidebarFooter className="relative m-1 mt-0 space-y-1 p-0">
      {isAuthenticated ? (
        <Link
          to="/settings"
          aria-label="Go to settings"
          role="button"
          className="flex select-none flex-row items-center justify-between gap-3 rounded-lg px-3 py-3 hover:bg-sidebar-accent focus:bg-sidebar-accent focus:outline-none"
          data-discover="true"
        >
          <div className="flex w-full min-w-0 flex-row items-center gap-3">
            <Avatar className="h-8 w-8 rounded-full ring-1 ring-muted-foreground/20">
              <AvatarImage src={imageUrl || ""} alt={displayName || "User"} />
              <AvatarFallback className="text-sm">{initial}</AvatarFallback>
            </Avatar>
            <div className="flex min-w-0 flex-col text-foreground">
              <span className="truncate text-sm font-medium">
                {displayName}
              </span>
              <span className="text-xs text-muted-foreground">Free</span>
            </div>
          </div>
        </Link>
      ) : (
        <AuthCard
          unAuthedNewUser={unAuthedNewUser}
          unAuthedReturningUser={unAuthedReturningUser}
          markAsVisited={markAsVisited}
        />
      )}
    </SidebarFooter>
  );
}
