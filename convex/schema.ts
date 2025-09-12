import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    // Fields are optional
  }),
  userConfigurations: defineTable({
    userId: v.string(),
    favoriteModels: v.array(v.string()),
  }).index("by_user", ["userId"]),
});
