import { SidebarFooter } from "@/components/ui/sidebar";
import { Link } from "react-router";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { AuthCard } from "./auth-card-sidebar-footer";
import { useUser, useIsAuthenticated } from "@/features/auth/store";
import Avvvatars from "avvvatars-react";

export function AppSidebarFooter() {
  const isAuthenticated = useIsAuthenticated();
  const user = useUser();
  const displayName =
    user?.name || user?.displayUsername || user?.username || "";
  const imageUrl = user?.image ?? undefined;

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
            {imageUrl ? (
              <Avatar className="size-8 rounded-full ring-1 ring-muted-foreground/20">
                <AvatarImage src={imageUrl} alt={displayName || "User"} />
              </Avatar>
            ) : (
              <div
                className="size-8 rounded-full ring-1 ring-muted-foreground/20 overflow-hidden"
                role="img"
                aria-label={`${displayName || "User"} avatar`}
              >
                <Avvvatars
                  value={user?.email || displayName || "user"}
                  size={32}
                  style="shape"
                  shadow={false}
                  border={false}
                />
              </div>
            )}
            <div className="flex min-w-0 flex-col text-foreground">
              <span className="truncate text-sm font-medium">
                {displayName}
              </span>
              <span className="text-xs text-muted-foreground">Free</span>
            </div>
          </div>
        </Link>
      ) : (
        <AuthCard />
      )}
    </SidebarFooter>
  );
}
