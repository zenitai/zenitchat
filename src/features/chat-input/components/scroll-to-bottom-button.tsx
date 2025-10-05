import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useChatInputContext } from "../context";

export function ScrollToBottomButton() {
  const { showScrollToBottom, onScrollToBottom } = useChatInputContext();

  if (!showScrollToBottom) {
    return null;
  }

  return (
    <div className="pointer-events-none flex justify-center pb-4">
      <Button
        onClick={onScrollToBottom}
        variant="outline"
        className={cn(
          "pointer-events-auto",
          "transition-colors",
          "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
          "[&_svg]:size-4",
          "disabled:hover:bg-secondary/50 h-8 px-3 text-xs",
          "flex border-secondary",
          "text-secondary-foreground/70 hover:bg-secondary",
          "bg-background/80 backdrop-blur-sm",
          "select-none",
        )}
      >
        <span className="pb-0.5">Scroll to bottom</span>
        <ChevronDown className="-mr-1 h-4 w-4" />
      </Button>
    </div>
  );
}
