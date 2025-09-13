import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useEffect } from "react";
import { env } from "@/env";
import { DEFAULT_FAVORITE_MODELS } from "@/shared/constants";
import { toast } from "sonner";

const LOCAL_STORAGE_KEY = `${env.NEXT_PUBLIC_LOCALSTORAGE_PREFIX}-user-configurations`;

// Safe localStorage helpers (SSR-safe, parse-safe)
const safeReadLocalConfig = (): { favoriteModels?: string[] } => {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(LOCAL_STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
};

const safeWriteLocalConfig = (cfg: unknown) => {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(cfg));
  } catch {
    // ignore quota/availability errors
  }
};

export function useUserModels() {
  // Query user's favorite models from Convex
  const favoriteModelsFromConvex = useQuery(
    api.user_configurations.models.getFavoriteModels,
  );

  // Get cached user configurations from localStorage for optimistic UI
  const userConfigFromLocalStorage = safeReadLocalConfig();
  const favoriteModelsFromLocalStorage: string[] =
    userConfigFromLocalStorage.favoriteModels || [];

  // Sync Convex data to localStorage
  useEffect(() => {
    if (favoriteModelsFromConvex) {
      const currentConfig = safeReadLocalConfig();
      const updatedConfig = {
        ...currentConfig,
        favoriteModels: favoriteModelsFromConvex,
      };
      safeWriteLocalConfig(updatedConfig);
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
      try {
        await removeFavoriteMutation({ modelId });
      } catch (e) {
        console.error("Failed to remove favorite", e);
        toast.error("Failed to remove favorite model");
      }
    } else {
      try {
        await addFavoriteMutation({ modelId });
      } catch (e) {
        console.error("Failed to add favorite", e);
        toast.error("Failed to add favorite model");
      }
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
