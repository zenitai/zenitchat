import { mutation, query } from "../_generated/server";
import { v } from "convex/values";
import { betterAuthComponent } from "../auth";
import { DEFAULT_FAVORITE_MODELS } from "../../src/shared/constants";

// Get user's favorite models
export const getFavoriteModels = query({
  args: {},
  handler: async (ctx) => {
    const userId = await betterAuthComponent.getAuthUserId(ctx);
    if (!userId) {
      return null;
    }

    const config = await ctx.db
      .query("userConfigurations")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();

    return config?.favoriteModels;
  },
});

// Add a model to favorites
export const addFavorite = mutation({
  args: {
    modelId: v.string(),
  },
  handler: async (ctx, { modelId }) => {
    const userId = await betterAuthComponent.getAuthUserId(ctx);
    if (!userId) {
      throw new Error("User not authenticated");
    }

    const config = await ctx.db
      .query("userConfigurations")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();

    // Use defaults if no config exists
    const currentFavorites = config?.favoriteModels ?? DEFAULT_FAVORITE_MODELS;

    // Don't add if already exists
    if (currentFavorites.includes(modelId)) {
      return currentFavorites;
    }

    const newFavorites = [...currentFavorites, modelId];

    if (config) {
      await ctx.db.patch(config._id, {
        favoriteModels: newFavorites,
      });
    } else {
      // Create with defaults + new favorite
      await ctx.db.insert("userConfigurations", {
        userId,
        favoriteModels: newFavorites,
      });
    }

    return newFavorites;
  },
});

// Remove a model from favorites
export const removeFavorite = mutation({
  args: {
    modelId: v.string(),
  },
  handler: async (ctx, { modelId }) => {
    const userId = await betterAuthComponent.getAuthUserId(ctx);
    if (!userId) {
      throw new Error("User not authenticated");
    }

    const config = await ctx.db
      .query("userConfigurations")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();

    // Use defaults if no config exists
    const currentFavorites = config?.favoriteModels ?? DEFAULT_FAVORITE_MODELS;
    const newFavorites = currentFavorites.filter((id) => id !== modelId);

    if (config) {
      await ctx.db.patch(config._id, {
        favoriteModels: newFavorites,
      });
    } else {
      // Only create config if there are favorites to store
      if (newFavorites.length > 0) {
        await ctx.db.insert("userConfigurations", {
          userId,
          favoriteModels: newFavorites,
        });
      }
    }

    return newFavorites;
  },
});
