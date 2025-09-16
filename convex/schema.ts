import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    email: v.optional(v.string()),
    name: v.optional(v.string()),
    image: v.optional(v.string()),
    username: v.optional(v.string()),
    displayUsername: v.optional(v.string()),
    emailVerified: v.optional(v.boolean()),
    twoFactorEnabled: v.optional(v.boolean()),
    isAnonymous: v.optional(v.boolean()),
    phoneNumber: v.optional(v.string()),
    phoneNumberVerified: v.optional(v.boolean()),
    createdAt: v.optional(v.number()),
    updatedAt: v.optional(v.number()),
  }),
  userConfigurations: defineTable({
    userId: v.string(),
    favoriteModels: v.array(v.string()),
  }).index("by_user", ["userId"]),
});
