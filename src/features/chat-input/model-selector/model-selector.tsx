import { useState, useMemo } from "react";
import { ChevronDownIcon, Gem } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { ALL_MODELS, ModelIcon } from "@/config/ai-models";
import type { ModelConfig } from "@/config/ai-models/types";
import {
  ModelSearch,
  ModelRow,
  ModelSelectorFooter,
  ExpandedModelList,
} from "./components";
import { useUserModels } from "./hooks/use-user-models";
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

  // Get user models data once at the top level
  const { favoriteModels, toggleModelFavorite, isFavorite } = useUserModels();

  // Filter models based on search query
  const filteredModels = useMemo(() => {
    if (!searchQuery.trim()) return ALL_MODELS;

    const query = searchQuery.toLowerCase();
    return ALL_MODELS.filter(
      (model) =>
        model.displayName.toLowerCase().includes(query) ||
        model.creator.toLowerCase().includes(query) ||
        model.description.toLowerCase().includes(query) ||
        model.features.some((feature) => feature.toLowerCase().includes(query)),
    );
  }, [searchQuery]);

  // Count new models
  const newModelsCount = useMemo(() => {
    return ALL_MODELS.filter((model) => model.new).length;
  }, []);

  const handleModelSelect = (model: ModelConfig) => {
    onModelSelect(model);
    setOpen(false);
    setSearchQuery(""); // Clear search when selecting a model
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

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button
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

        {/* Footer */}
        <ModelSelectorFooter
          onShowAll={handleShowAll}
          onFilter={() => {
            // TODO: Implement filter functionality
            console.log("Filter clicked");
          }}
          newModelsCount={newModelsCount}
          isExpanded={showExpanded}
        />
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
