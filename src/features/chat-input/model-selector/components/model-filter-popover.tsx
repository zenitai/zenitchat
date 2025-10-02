import { useState, useId } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { Filter, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { CREATOR_NAMES, FeatureBadge } from "@/features/models";
import type { ModelFeature, ModelCreator } from "@/features/models";

// Filter options based on available ModelFeature types
const filterOptions: ModelFeature[] = [
  "vision",
  "reasoning",
  "multimodal",
  "tool-calling",
];

interface ModelFilterProps {
  selectedFilters: ModelFeature[];
  onFiltersChange: (filters: ModelFeature[]) => void;
  selectedProvider: ModelCreator | "all";
  onProviderChange: (provider: ModelCreator | "all") => void;
  onClearAllFilters: () => void;
}

export function ModelFilter({
  selectedFilters,
  onFiltersChange,
  selectedProvider,
  onProviderChange,
  onClearAllFilters,
}: ModelFilterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const selectId = useId();
  const isMobile = useIsMobile();

  // Get all available providers from the type definition
  const providers = Object.keys(
    CREATOR_NAMES,
  ) as (keyof typeof CREATOR_NAMES)[];

  // Check if any filters are active
  const hasActiveFilters =
    selectedProvider !== "all" || selectedFilters.length > 0;

  const toggleFilter = (filterId: ModelFeature) => {
    const newFilters = selectedFilters.includes(filterId)
      ? selectedFilters.filter((id) => id !== filterId)
      : [...selectedFilters, filterId];
    onFiltersChange(newFilters);
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            "h-8 w-8 text-muted-foreground",
            "hover:bg-muted/40 hover:text-foreground",
          )}
        >
          <Filter className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className={cn(
          "min-w-[8rem] p-0",
          "!outline-1 !outline-chat-border/20 dark:!outline-white/5",
          "w-56 rounded-lg max-w-[calc(100vw-2rem)] max-h-[calc(100vh-120px)]",
          "max-sm:mx-4 transition-[height,width]",
        )}
        align="end"
        side="right"
        sideOffset={4}
      >
        {/* Clear All Filters Button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={hasActiveFilters ? onClearAllFilters : undefined}
          className={cn(
            "w-full h-9 rounded-none rounded-t-lg border-b bg-popover text-xs font-medium text-muted-foreground",
            hasActiveFilters && "hover:text-foreground cursor-pointer",
            !hasActiveFilters && "cursor-default",
          )}
        >
          {hasActiveFilters ? "Clear filters" : "Filter options"}
        </Button>

        {/* Content Container */}
        <div className="p-3">
          {/* Provider Filter */}
          <div className="mb-3">
            <Label
              htmlFor={selectId}
              className="text-xs font-medium text-muted-foreground mb-1.5 block"
            >
              Provider
            </Label>
            <Select value={selectedProvider} onValueChange={onProviderChange}>
              <SelectTrigger
                id={selectId}
                className="h-8 w-full text-sm !bg-transparent"
              >
                <SelectValue placeholder="All providers" />
              </SelectTrigger>
              <SelectContent
                side={isMobile ? "top" : "right"}
                align="start"
                className="max-w-[200px] max-h-[200px] overflow-y-auto custom-scrollbar [&_[data-slot=select-scroll-up-button]]:hidden [&_[data-slot=select-scroll-down-button]]:hidden"
              >
                <SelectItem value="all">All providers</SelectItem>
                {providers.map((provider) => (
                  <SelectItem key={provider} value={provider}>
                    {CREATOR_NAMES[provider]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Feature Filters */}
          <div className="mb-2">
            <Label className="text-xs font-medium text-muted-foreground mb-1.5 block">
              Features
            </Label>
            <div className="space-y-1">
              {filterOptions.map((feature) => {
                const isSelected = selectedFilters.includes(feature);

                return (
                  <div
                    key={feature}
                    role="menuitemcheckbox"
                    aria-checked={isSelected}
                    className={cn(
                      "relative cursor-pointer select-none rounded-sm px-2 py-1.5 text-sm outline-none",
                      "focus:bg-accent/30 focus:text-accent-foreground",
                      "data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
                      "flex items-center justify-between hover:bg-accent/30",
                    )}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      toggleFilter(feature);
                    }}
                  >
                    <div className="-ml-0.5 flex items-center gap-2">
                      <FeatureBadge feature={feature} />
                      <span className="capitalize">
                        {feature.replace("-", " ")}
                      </span>
                    </div>
                    <span className="flex h-3.5 w-3.5 items-center justify-center">
                      {isSelected && <Check className="h-3.5 w-3.5" />}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
