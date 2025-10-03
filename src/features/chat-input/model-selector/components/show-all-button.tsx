import { memo } from "react";
import { ChevronDownIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ShowAllButtonProps {
  onShowAll?: () => void;
  newModelsCount?: number;
  isExpanded?: boolean;
}

export const ShowAllButton = memo(
  ({
    onShowAll,
    newModelsCount = 0,
    isExpanded = false,
  }: ShowAllButtonProps) => {
    const handleShowAllClick = (e: React.MouseEvent) => {
      e.preventDefault();
      onShowAll?.();
    };

    return (
      <Button
        variant="ghost"
        size="sm"
        onMouseDown={handleShowAllClick}
        className={cn(
          "h-9 px-4 py-2 pl-2 text-sm text-muted-foreground cursor-pointer",
          "hover:bg-muted/40 hover:text-foreground",
          "active:bg-muted/40 active:text-foreground",
          "transition-colors duration-150",
          "select-none",
          // Add chevron rotation animation
          isExpanded && "[&_.chevron]:rotate-90",
        )}
        style={{ cursor: "pointer" }}
      >
        <ChevronDownIcon
          className={cn(
            "chevron h-4 w-4 rotate-180 transition-transform duration-200",
          )}
        />
        <span>{isExpanded ? "Show less" : "Show all"}</span>
        {newModelsCount > 0 && (
          <div
            className="h-2 w-2 rounded-full bg-pink-500"
            data-state="closed"
          ></div>
        )}
      </Button>
    );
  },
);

ShowAllButton.displayName = "ShowAllButton";
