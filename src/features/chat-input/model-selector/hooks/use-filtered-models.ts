import { useMemo } from "react";
import { ALL_MODELS } from "@/features/models";
import type { ModelFeature, ModelCreator } from "@/features/models";

interface UseFilteredModelsProps {
  searchQuery: string;
  selectedFilters: ModelFeature[];
  selectedProvider: ModelCreator | "all";
}

export function useFilteredModels({
  searchQuery,
  selectedFilters,
  selectedProvider,
}: UseFilteredModelsProps) {
  const filteredModels = useMemo(() => {
    let models = ALL_MODELS;

    // Apply provider filter
    if (selectedProvider !== "all") {
      models = models.filter((model) => model.creator === selectedProvider);
    }

    // Apply feature filter
    if (selectedFilters.length > 0) {
      models = models.filter((model) =>
        selectedFilters.every((filter) =>
          (model.features as ModelFeature[]).includes(filter),
        ),
      );
    }

    // Apply search query filter
    if (searchQuery.trim()) {
      const query = searchQuery.trim().toLowerCase();
      models = models.filter(
        (model) =>
          model.displayName.toLowerCase().includes(query) ||
          model.creator.toLowerCase().includes(query) ||
          model.description.toLowerCase().includes(query) ||
          model.features.some((feature) =>
            feature.toLowerCase().includes(query),
          ),
      );
    }

    return models;
  }, [searchQuery, selectedFilters, selectedProvider]);

  // Count new models
  const newModelsCount = useMemo(() => {
    return ALL_MODELS.filter((model) => model.new).length;
  }, []);

  return {
    filteredModels,
    newModelsCount,
  };
}
