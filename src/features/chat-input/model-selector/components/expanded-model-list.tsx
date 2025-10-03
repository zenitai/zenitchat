import { Pin } from "lucide-react";
import { ModelCard } from "./model-card";
import type { ModelConfig } from "@/features/models";
import { useIsAuthenticated } from "@/features/auth/store";
import { cn } from "@/lib/utils";

interface ExpandedModelListProps {
  selectedModel: string;
  onModelSelect: (model: ModelConfig) => void;
  onClose: () => void;
  filteredModels: readonly ModelConfig[];
  favoriteModels: string[];
  toggleModelFavorite: (modelId: string) => Promise<void>;
  isFavorite: (modelId: string) => boolean;
  variant?: "default" | "compact";
}

export function ExpandedModelList({
  selectedModel,
  onModelSelect,
  onClose,
  filteredModels,
  favoriteModels,
  toggleModelFavorite,
  isFavorite,
  variant = "default",
}: ExpandedModelListProps) {
  const isAuthenticated = useIsAuthenticated();
  // Separate pinned and unpinned models
  const pinnedModelsList = filteredModels.filter((model: ModelConfig) =>
    isFavorite(model.id),
  );
  const unpinnedModels = filteredModels.filter(
    (model: ModelConfig) => !isFavorite(model.id),
  );

  const handleModelSelect = (model: ModelConfig) => {
    onModelSelect(model);
    onClose();
  };

  const handleTogglePin = (model: ModelConfig) => {
    toggleModelFavorite(model.id);
  };

  return (
    <div
      className={cn(
        "overflow-y-auto px-1.5 sm:w-[640px] custom-scrollbar scroll-shadow",
        "max-h-[450px]", // Always compact on mobile
        variant === "compact"
          ? "sm:max-h-[450px]"
          : "sm:max-h-[min(650px,calc(100vh-200px))]", // Responsive on desktop, capped at 650px
      )}
      data-shadow="true"
    >
      <div className="flex w-full flex-wrap justify-start gap-3.5 pb-4 pl-3 pr-2 pt-2.5">
        {/* Favorites Section - Only show if there are pinned models */}
        {pinnedModelsList.length > 0 && (
          <>
            {/* Favorites Section Header */}
            <div className="-mb-2 ml-0 flex w-full select-none items-center justify-start gap-1.5 text-color-heading">
              <Pin className="mt-px size-4" />
              Favorites
            </div>

            {/* Pinned Models */}
            {pinnedModelsList.map((model) => (
              <div
                key={model.id}
                className="group relative"
                data-state="closed"
              >
                <ModelCard
                  model={model}
                  isSelected={selectedModel === model.id}
                  isPinned={true}
                  canToggle={isAuthenticated && favoriteModels.length > 1}
                  onSelect={handleModelSelect}
                  onPin={handleTogglePin}
                />
              </div>
            ))}
          </>
        )}

        {/* Others Section Header */}
        {unpinnedModels.length > 0 && (
          <div className="-mb-2 ml-2 mt-1 w-full select-none text-color-heading">
            Others
          </div>
        )}

        {/* Show unpinned models if no search or if there are results */}
        {unpinnedModels.map((model) => (
          <div key={model.id} className="group relative" data-state="closed">
            <ModelCard
              model={model}
              isSelected={selectedModel === model.id}
              isPinned={false}
              disabled={!isAuthenticated}
              canToggle={isAuthenticated}
              onSelect={handleModelSelect}
              onPin={handleTogglePin}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
