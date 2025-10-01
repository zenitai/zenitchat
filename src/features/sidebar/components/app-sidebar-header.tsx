import { SidebarHeader } from "@/components/ui/sidebar";
import { useNavigate, useLocation } from "react-router";
import { ThreadSearch } from "./thread-search";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { getModifierKey } from "@/lib/get-platform";

export function AppSidebarHeader() {
  const navigate = useNavigate();
  const location = useLocation();
  const modifierKey = getModifierKey();

  const handleNewChat = () => {
    if (location.pathname !== "/") {
      navigate("/");
    }
  };

  return (
    <SidebarHeader className="relative m-1 mb-0 space-y-1 p-0 border-b">
      <div onClick={handleNewChat} className="cursor-pointer">
        <div className="flex items-center justify-center w-full px-2">
          <span className="text-2xl tracking-tighter">Zenit</span>
        </div>
      </div>
      {/* New Chat Button */}
      <div className="px-1">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              onClick={handleNewChat}
              className="w-full h-9 px-4 py-2 text-sm"
            >
              <span className="w-full select-none text-center">New Chat</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right">
            <div className="flex items-center gap-1">
              <kbd>
                <span className="text-xs">{modifierKey}</span>
              </kbd>
              <kbd>Shift</kbd>
              <kbd>O</kbd>
            </div>
          </TooltipContent>
        </Tooltip>
      </div>
      <ThreadSearch />
    </SidebarHeader>
  );
}
