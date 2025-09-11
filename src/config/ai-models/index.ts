import { OPENAI_MODELS } from "./openai";
import { GOOGLE_MODELS } from "./google";
import { ModelCreator, PricingTier, InfrastructureProvider } from "./types";

// Re-export all model configurations
export { OPENAI_MODELS } from "./openai";
export { GOOGLE_MODELS } from "./google";

export const ALL_MODELS = [...OPENAI_MODELS, ...GOOGLE_MODELS] as const;

// Re-export icon registry
export { getIcon, ModelIcon } from "./icon-registry";

// Utility functions for model lookup
export const getModelById = (id: string) => {
  return ALL_MODELS.find((model) => model.id === id);
};

export const getModelsByCreator = (creator: ModelCreator) => {
  return ALL_MODELS.filter((model) => model.creator === creator);
};

export const getModelsByInfrastructureProvider = (
  provider: InfrastructureProvider,
) => {
  return ALL_MODELS.filter(
    (model) => model.infrastructureProvider === provider,
  );
};

export const getModelsByPricingTier = (tier: PricingTier) => {
  return ALL_MODELS.filter((model) => model.pricingTier === tier);
};
