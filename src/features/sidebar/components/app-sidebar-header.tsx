import { SidebarHeader } from "@/components/ui/sidebar";
import { Link } from "react-router";
import { ThreadSearch } from "./thread-search";
import { Button } from "@/components/ui/button";

export function AppSidebarHeader() {
  return (
    <SidebarHeader className="relative m-1 mb-0 space-y-1 p-0">
      <Link to="/">
        <div className="flex items-center justify-center w-full px-2">
          <span className="text-2xl tracking-tighter">Zenit</span>
        </div>
      </Link>
      {/* New Chat Button */}
      <div className="px-1">
        <Button asChild className="w-full h-9 px-4 py-2 text-sm">
          <Link to="/">
            <span className="w-full select-none text-center">New Chat</span>
          </Link>
        </Button>
      </div>
      <ThreadSearch />
    </SidebarHeader>
  );
}
