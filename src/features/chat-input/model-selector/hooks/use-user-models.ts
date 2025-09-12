import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useEffect } from "react";
import { env } from "@/env";

// Default models - these should match your AI models config
const DEFAULT_FAVORITE_MODELS = [
  "google/gemini-2.0-flash",
  "google/gemini-2.5-flash",
  "openai/gpt-5-mini",
  "openai/o4-mini",
];

const LOCAL_STORAGE_KEY = `${env.NEXT_PUBLIC_LOCALSTORAGE_PREFIX}-user-configurations`;

export function useUserModels() {
  // Query user's favorite models from Convex
  const favoriteModelsFromConvex = useQuery(
    api.user_configurations.models.getFavoriteModels,
  );

  // Get cached user configurations from localStorage for optimistic UI
  const userConfigFromLocalStorage = JSON.parse(
    localStorage.getItem(LOCAL_STORAGE_KEY) || "{}",
  );
  const favoriteModelsFromLocalStorage: string[] =
    userConfigFromLocalStorage.favoriteModels || [];

  // Sync Convex data to localStorage
  useEffect(() => {
    if (favoriteModelsFromConvex) {
      const currentConfig = JSON.parse(
        localStorage.getItem(LOCAL_STORAGE_KEY) || "{}",
      );
      const updatedConfig = {
        ...currentConfig,
        favoriteModels: favoriteModelsFromConvex,
      };
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedConfig));
    }
  }, [favoriteModelsFromConvex]);

  // Mutations
  const addFavoriteMutation = useMutation(
    api.user_configurations.models.addFavorite,
  ).withOptimisticUpdate((localStore, args) => {
    const { modelId } = args;
    const currentFavorites = localStore.getQuery(
      api.user_configurations.models.getFavoriteModels,
    );

    if (currentFavorites !== undefined) {
      // Treat null as empty array for new users
      const favorites = currentFavorites ?? [];

      if (!favorites.includes(modelId)) {
        localStore.setQuery(
          api.user_configurations.models.getFavoriteModels,
          {},
          [...favorites, modelId],
        );
      }
    }
  });

  const removeFavoriteMutation = useMutation(
    api.user_configurations.models.removeFavorite,
  ).withOptimisticUpdate((localStore, args) => {
    const { modelId } = args;
    const currentFavorites = localStore.getQuery(
      api.user_configurations.models.getFavoriteModels,
    );

    if (currentFavorites !== undefined) {
      // Treat null as empty array for new users
      const favorites = currentFavorites ?? [];

      if (favorites.length > 1) {
        localStore.setQuery(
          api.user_configurations.models.getFavoriteModels,
          {},
          favorites.filter((id) => id !== modelId),
        );
      }
    }
  });

  // Effective favorite models (Convex data or localStorage fallback or defaults)
  const effectiveFavoriteModels =
    favoriteModelsFromConvex && favoriteModelsFromConvex.length > 0
      ? favoriteModelsFromConvex
      : favoriteModelsFromLocalStorage &&
          favoriteModelsFromLocalStorage.length > 0
        ? favoriteModelsFromLocalStorage
        : DEFAULT_FAVORITE_MODELS;

  const isFavorite = (modelId: string) => {
    return effectiveFavoriteModels.includes(modelId);
  };

  const toggleModelFavorite = async (modelId: string) => {
    const isCurrentlyFavorite = isFavorite(modelId);

    if (isCurrentlyFavorite) {
      // Don't allow removing the last favorite model
      if (effectiveFavoriteModels.length <= 1) {
        console.warn("Cannot remove the last favorite model");
        return;
      }
      await removeFavoriteMutation({ modelId });
    } else {
      await addFavoriteMutation({ modelId });
    }
  };

  return {
    favoriteModels: effectiveFavoriteModels,
    addFavorite: addFavoriteMutation,
    removeFavorite: removeFavoriteMutation,
    toggleModelFavorite,
    isFavorite,
  };
}
