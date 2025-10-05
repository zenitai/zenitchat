import { useState, useCallback } from "react";
import { ChevronDownIcon, Gem } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { ModelIcon } from "@/features/models";
import type { ModelCreator, ModelFeature } from "@/features/models";
import {
  ModelSearch,
  ModelRow,
  ShowAllButton,
  ExpandedModelList,
  ModelFilter,
} from "./components";
import { useUserModels } from "./hooks/use-user-models";
import { useFilteredModels } from "./hooks/use-filtered-models";
import { useChatInputContext } from "../context";
import { cn } from "@/lib/utils";

export interface ModelSelectorProps {
  variant?: "default" | "compact";
}

export const ModelSelector = ({ variant = "default" }: ModelSelectorProps) => {
  const { selectedModel, setSelectedModel } = useChatInputContext();
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showExpanded, setShowExpanded] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState<ModelFeature[]>([]);
  const [selectedProvider, setSelectedProvider] = useState<
    ModelCreator | "all"
  >("all");

  // Get user models data once at the top level
  const { favoriteModels, toggleModelFavorite, isFavorite } = useUserModels();

  // Get filtered models and new models count
  const { filteredModels, newModelsCount } = useFilteredModels({
    searchQuery,
    selectedFilters,
    selectedProvider,
  });

  const handleModelSelect = (model: typeof selectedModel) => {
    setSelectedModel(model);
    setOpen(false);
    setSearchQuery(""); // Clear search when selecting a model
    setSelectedProvider("all"); // Clear provider filter when selecting a model
    setShowExpanded(false); // Close expanded view when selecting a model
  };

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    // Auto-switch to expanded view when user starts typing
    if (value.trim() && !showExpanded) {
      setShowExpanded(true);
    }
  };

  const handleShowAll = useCallback(() => {
    setShowExpanded((prev) => !prev);
  }, []);

  const handleCloseExpanded = useCallback(() => {
    setShowExpanded(false);
  }, []);

  const handleClearAllFilters = useCallback(() => {
    setSelectedProvider("all");
    setSelectedFilters([]);
  }, []);

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          className="flex bg-transparent focus:ring-0 focus:ring-offset-0 focus-visible:ring-0 focus-visible:ring-offset-0"
        >
          {selectedModel ? (
            <div className="min-w-0 flex-1 text-left text-sm font-medium flex items-center gap-2">
              <ModelIcon creator={selectedModel.creator} className="size-4" />
              <span className="truncate">{selectedModel.displayName}</span>
              {selectedModel.pricingTier === "premium" && (
                <Gem className="size-4 text-blue-500" />
              )}
            </div>
          ) : (
            <span className="text-muted-foreground">Select Model</span>
          )}
          <ChevronDownIcon className="size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        avoidCollisions={true}
        collisionPadding={8}
        sticky="always"
        className={cn(
          "!outline-1 !outline-chat-border/20 dark:!outline-white/5",
          "relative overflow-hidden rounded-lg !border-none",
          "p-0 pb-11 pt-10",
          "max-sm:mx-2 sm:rounded-lg",
          "!max-h-[min(600px,var(--radix-dropdown-menu-content-available-height))]", // Respect available space
          variant === "compact"
            ? "sm:!max-h-[min(600px,var(--radix-dropdown-menu-content-available-height))]"
            : "sm:!max-h-[min(800px,var(--radix-dropdown-menu-content-available-height))]",
          // Adjust width when showing grid
          showExpanded
            ? "w-[min(640px,calc(100vw-1rem))]"
            : "w-[min(420px,calc(100vw-1rem))]",
        )}
        style={
          { outline: "none", "--shadow-height": "10px" } as React.CSSProperties
        }
      >
        {/* Search Header */}
        <ModelSearch value={searchQuery} onChange={handleSearchChange} />

        {/* Conditional Content */}
        {showExpanded ? (
          /* Grid Layout */
          <ExpandedModelList
            selectedModel={selectedModel?.id || ""}
            filteredModels={filteredModels}
            onModelSelect={handleModelSelect}
            onClose={handleCloseExpanded}
            favoriteModels={favoriteModels}
            toggleModelFavorite={toggleModelFavorite}
            isFavorite={isFavorite}
            variant={variant}
          />
        ) : (
          /* Row-based List */
          <div
            className={cn(
              "overflow-y-auto px-1.5 pb-3 custom-scrollbar scroll-shadow",
              "max-h-[min(450px,calc(var(--radix-dropdown-menu-content-available-height)-120px))]",
              variant === "compact"
                ? "sm:max-h-[min(450px,calc(var(--radix-dropdown-menu-content-available-height)-120px))]"
                : "sm:max-h-[min(650px,calc(var(--radix-dropdown-menu-content-available-height)-120px))]",
            )}
            data-shadow="true"
          >
            {filteredModels
              .filter((model) => isFavorite(model.id))
              .map((model) => (
                <ModelRow
                  key={model.id}
                  model={model}
                  onSelect={handleModelSelect}
                />
              ))}
          </div>
        )}

        {/* Footer and Filter */}
        <div className="absolute inset-x-0 bottom-0 z-10 flex items-center justify-between rounded-b-lg bg-popover pb-1 pl-1 pr-2.5 pt-1.5">
          <div className="absolute inset-x-3.5 top-0 border-b"></div>
          <ShowAllButton
            onShowAll={handleShowAll}
            newModelsCount={newModelsCount}
            isExpanded={showExpanded}
          />
          <ModelFilter
            selectedFilters={selectedFilters}
            onFiltersChange={setSelectedFilters}
            selectedProvider={selectedProvider}
            onProviderChange={setSelectedProvider}
            onClearAllFilters={handleClearAllFilters}
          />
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

ModelSelector.displayName = "ChatInput.ModelSelector";
