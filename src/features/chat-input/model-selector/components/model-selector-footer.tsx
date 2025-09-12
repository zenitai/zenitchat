import { ChevronUp, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ModelSelectorFooterProps {
  onShowAll?: () => void;
  onFilter?: () => void;
  showAllCount?: number;
  isExpanded?: boolean;
}

export const ModelSelectorFooter = ({
  onShowAll,
  onFilter,
  showAllCount = 0,
  isExpanded = false,
}: ModelSelectorFooterProps) => {
  const handleShowAllClick = () => {
    onShowAll?.();
  };

  return (
    <div className="flex items-center justify-between border-t pr-2.5 pt-1.5 pb-1">
      <Button
        variant="ghost"
        size="sm"
        onClick={handleShowAllClick}
        className="h-9 px-4 py-2 text-muted-foreground flex items-center gap-2 pl-2 text-sm hover:bg-muted/40 hover:text-foreground"
      >
        <ChevronUp
          className={`size-4 transition-transform duration-200 ${
            isExpanded ? "-rotate-90" : "rotate-0"
          }`}
        />
        <span>{isExpanded ? "Show less" : "Show all"}</span>
        {showAllCount > 0 && (
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
        className="h-8 rounded-md text-xs text-muted-foreground relative gap-2 px-2 hover:bg-muted/40 hover:text-foreground"
      >
        <Filter className="size-4" />
      </Button>
    </div>
  );
};
