import type { ModelCreator } from "./types";
import { ALL_MODELS, CREATOR_NAMES, ALL_CREATORS } from "./constants";

export const getModelById = (id: string) => {
  return ALL_MODELS.find((model) => model.id === id);
};

export const getModelsByCreator = (creator: ModelCreator) => {
  return ALL_MODELS.filter((model) => model.creator === creator);
};

export const getAvailableCreators = (): ModelCreator[] => {
  return ALL_CREATORS.filter((creator) => {
    const models = getModelsByCreator(creator);
    return models.length > 0;
  });
};

export const getCreatorDisplayName = (creator: ModelCreator): string => {
  return CREATOR_NAMES[creator];
};
