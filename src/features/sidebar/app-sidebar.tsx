import { useLocation } from "react-router";
import { useAuth } from "@/features/auth";
import { useThreadData } from "./hooks/use-thread-data";
import { useThreadGroups } from "./hooks/use-thread-groups";
import { siteConfig } from "@/config/site.config";
import { Sidebar, SidebarContent, SidebarRail } from "@/components/ui/sidebar";
import { AppSidebarHeader } from "./components/app-sidebar-header";
import { ThreadGroup } from "./components/thread-group";
import { PinnedThreadGroup } from "./components/pinned-thread-group";
import { AppSidebarFooter } from "./components/app-sidebar-footer";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const location = useLocation();
  const auth = useAuth();
  const { threads } = useThreadData();
  const data = useThreadGroups(threads);

  return (
    <Sidebar className="p-2 bg-sidebar" {...props}>
      <AppSidebarHeader />
      <SidebarContent className="scroll-shadow hidden-scrollbar">
        {auth.isAuthenticated && (
          <>
            {data.threadGroups.length > 0 ? (
              /* Thread groups */
              data.threadGroups.map((group) =>
                group.title === "Pinned" ? (
                  <PinnedThreadGroup
                    key={group.title}
                    title={group.title}
                    items={group.items}
                    currentPathname={location.pathname}
                  />
                ) : (
                  <ThreadGroup
                    key={group.title}
                    title={group.title}
                    items={group.items}
                    currentPathname={location.pathname}
                  />
                ),
              )
            ) : (
              /* No threads state */
              <div className="px-4 py-8 text-center">
                <p className="text-sm text-muted-foreground">
                  No threads yet. Start a new chat to use {siteConfig.name}.
                </p>
              </div>
            )}
          </>
        )}
      </SidebarContent>
      <AppSidebarFooter auth={auth} />
      <SidebarRail />
    </Sidebar>
  );
}
