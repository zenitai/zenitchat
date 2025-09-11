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
import { ModelSearch, ModelRow } from "./components";

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

  const handleModelSelect = (model: ModelConfig) => {
    onModelSelect(model);
    setOpen(false);
    setSearchQuery(""); // Clear search when selecting a model
  };

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
  };

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="flex items-center gap-2 bg-transparent focus:ring-0 focus:ring-offset-0 focus-visible:ring-0 focus-visible:ring-offset-0"
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
        className="w-96 max-w-[calc(100vw-2rem)] max-sm:mx-4 sm:w-[420px] max-h-128 flex flex-col !p-0"
        align="start"
      >
        <div className="sticky top-0 z-10">
          <ModelSearch
            value={searchQuery}
            onChange={handleSearchChange}
            placeholder="Search models..."
          />
        </div>

        {/* Scrollable Content with proper padding */}
        <div className="flex-1 overflow-y-auto scroll-shadow custom-scrollbar px-1.5 pb-2">
          {filteredModels.map((model) => (
            <ModelRow
              key={model.id}
              model={model}
              onSelect={handleModelSelect}
            />
          ))}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
