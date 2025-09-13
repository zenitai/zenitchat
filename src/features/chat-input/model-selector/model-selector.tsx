import { useState } from "react";
import { ChevronDownIcon, Gem } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { ModelIcon } from "@/config/ai-models";
import type {
  ModelConfig,
  ModelCreator,
  ModelFeature,
} from "@/config/ai-models/types";
import {
  ModelSearch,
  ModelRow,
  ShowAllButton,
  ExpandedModelList,
  ModelFilter,
} from "./components";
import { useUserModels } from "./hooks/use-user-models";
import { useFilteredModels } from "./hooks/use-filtered-models";
import { cn } from "@/lib/utils";

interface ModelSelectorProps {
  selectedModel?: ModelConfig;
  onModelSelect: (model: ModelConfig) => void;
  disabled?: boolean;
}

export const ModelSelector = ({
  selectedModel,
  onModelSelect,
  disabled = false,
}: ModelSelectorProps) => {
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

  const handleModelSelect = (model: ModelConfig) => {
    onModelSelect(model);
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

  const handleShowAll = () => {
    setShowExpanded(!showExpanded);
  };

  const handleCloseExpanded = () => {
    setShowExpanded(false);
  };

  const handleClearAllFilters = () => {
    setSelectedProvider("all");
    setSelectedFilters([]);
  };

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          className="flex bg-transparent focus:ring-0 focus:ring-offset-0 focus-visible:ring-0 focus-visible:ring-offset-0"
          disabled={disabled}
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
        className={cn(
          "!outline-1 !outline-chat-border/20 dark:!outline-white/5",
          "relative overflow-hidden rounded-lg !border-none",
          "p-0 pb-11 pt-10 max-w-[calc(100vw-2rem)] transition-[height,width]",
          "max-sm:mx-4 sm:rounded-lg max-h-[calc(100vh-80px)]",
          // Adjust width when showing grid
          showExpanded ? "sm:w-[640px]" : "sm:w-[420px]",
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
          />
        ) : (
          /* Row-based List */
          <div
            className="max-h-[calc(100vh-200px)] overflow-y-auto px-1.5 pb-3 scrollbar-hide scroll-shadow"
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
        <div className="fixed inset-x-4 bottom-0 z-10 flex items-center justify-between rounded-b-lg bg-popover pb-1 pl-1 pr-2.5 pt-1.5 sm:inset-x-0">
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
