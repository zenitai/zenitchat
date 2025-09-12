import { ChevronDownIcon, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ModelSelectorFooterProps {
  onShowAll?: () => void;
  onFilter?: () => void;
  newModelsCount?: number;
  isExpanded?: boolean;
}

export const ModelSelectorFooter = ({
  onShowAll,
  onFilter,
  newModelsCount = 0,
  isExpanded = false,
}: ModelSelectorFooterProps) => {
  const handleShowAllClick = () => {
    onShowAll?.();
  };

  return (
    <div className="fixed inset-x-4 bottom-0 z-10 flex items-center justify-between rounded-b-lg bg-popover pb-1 pl-1 pr-2.5 pt-1.5 sm:inset-x-0">
      <div className="absolute inset-x-3 top-0 border-b"></div>
      <Button
        variant="ghost"
        size="sm"
        onClick={handleShowAllClick}
        className={cn(
          "h-9 px-4 py-2 pl-2 text-sm text-muted-foreground",
          "hover:bg-muted/40 hover:text-foreground",
          // Add chevron rotation animation
          isExpanded && "[&_.chevron]:rotate-90",
        )}
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
      <Button
        variant="ghost"
        size="sm"
        onClick={onFilter}
        className="h-9 px-4 py-2 text-sm text-muted-foreground hover:bg-muted/40 hover:text-foreground"
      >
        <Filter className="size-4" />
      </Button>
    </div>
  );
};
