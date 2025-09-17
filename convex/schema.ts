import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    email: v.string(),
    name: v.string(),
    image: v.optional(v.string()),
    username: v.optional(v.string()),
    displayUsername: v.optional(v.string()),
    emailVerified: v.boolean(),
    twoFactorEnabled: v.optional(v.boolean()),
    isAnonymous: v.optional(v.boolean()),
    phoneNumber: v.optional(v.string()),
    phoneNumberVerified: v.optional(v.boolean()),
    createdAt: v.number(),
    updatedAt: v.number(),
  }),
  userConfigurations: defineTable({
    userId: v.string(),
    favoriteModels: v.array(v.string()),
  }).index("by_user", ["userId"]),
});
