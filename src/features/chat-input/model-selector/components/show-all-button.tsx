import { ChevronDownIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ShowAllButtonProps {
  onShowAll?: () => void;
  newModelsCount?: number;
  isExpanded?: boolean;
}

export const ShowAllButton = ({
  onShowAll,
  newModelsCount = 0,
  isExpanded = false,
}: ShowAllButtonProps) => {
  const handleShowAllClick = () => {
    onShowAll?.();
  };

  return (
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
  );
};
