import { mutation, query } from "../_generated/server";
import { v } from "convex/values";
import { betterAuthComponent } from "../auth";

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
      .first();

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
      .first();

    const currentFavorites = config?.favoriteModels ?? [];

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
      .first();

    const currentFavorites = config?.favoriteModels ?? [];
    const newFavorites = currentFavorites.filter((id) => id !== modelId);

    if (config) {
      await ctx.db.patch(config._id, {
        favoriteModels: newFavorites,
      });
    } else {
      await ctx.db.insert("userConfigurations", {
        userId,
        favoriteModels: newFavorites,
      });
    }

    return newFavorites;
  },
});
