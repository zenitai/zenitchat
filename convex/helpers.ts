import { mutation } from "./_generated/server";
import { v } from "convex/values";
import { customMutation } from "convex-helpers/server/customFunctions";

export const internalApiMutation = customMutation(mutation, {
  args: { apiKey: v.string() },
  input: async (ctx, args) => {
    const expectedApiKey = process.env.CONVEX_BRIDGE_API_KEY;
    if (!expectedApiKey) {
      throw new Error("CONVEX_BRIDGE_API_KEY not configured");
    }
    if (args.apiKey !== expectedApiKey) {
      throw new Error("Unauthorized: Invalid API key");
    }

    return { ctx, args: {} };
  },
});
