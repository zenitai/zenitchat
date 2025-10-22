import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import {
  messageParts,
  messageErrors,
  messageMetadata,
} from "./schema/messages";

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
  threads: defineTable({
    threadId: v.string(),
    title: v.string(),
    createdAt: v.number(),
    updatedAt: v.number(),
    lastMessageAt: v.number(),
    generationStatus: v.union(
      v.literal("submitted"),
      v.literal("streaming"),
      v.literal("ready"),
      v.literal("error"),
    ),
    userSetTitle: v.optional(v.boolean()),
    userId: v.id("users"),
    model: v.string(),
    pinned: v.boolean(),
    branchParentThreadId: v.optional(v.string()),
    branchParentPublicMessageId: v.optional(v.string()),
  })
    .index("by_user", ["userId"])
    .index("by_thread_id", ["threadId"])
    .index("by_user_last_message", ["userId", "lastMessageAt"])
    .searchIndex("search_title", {
      searchField: "title",
      filterFields: ["userId"],
    }),
  messages: defineTable({
    messageId: v.string(),
    threadId: v.string(),
    userId: v.id("users"),
    role: v.union(
      v.literal("user"),
      v.literal("assistant"),
      v.literal("system"),
    ),
    parts: messageParts,
    createdAt: v.number(),
    updatedAt: v.number(),
    generationStatus: v.union(
      v.literal("submitted"),
      v.literal("streaming"),
      v.literal("ready"),
      v.literal("error"),
    ),
    errors: v.optional(messageErrors),
    metadata: v.optional(messageMetadata),
    attachmentIds: v.optional(v.array(v.string())),
  })
    .index("by_thread", ["threadId"])
    .index("by_thread_created", ["threadId", "createdAt"])
    .index("by_message_id", ["messageId"])
    .index("by_user", ["userId"]),
  attachments: defineTable({
    key: v.string(),
    filename: v.string(),
    mediaType: v.string(),
    url: v.string(),
    size: v.number(), // Client-provided size
    status: v.union(v.literal("pending"), v.literal("uploaded")),
    createdAt: v.number(),
    uploadedAt: v.optional(v.number()),
    userId: v.id("users"),
    threadId: v.optional(v.string()),
  })
    .index("by_user", ["userId"])
    .index("by_key", ["key"])
    .index("by_thread", ["threadId"])
    .index("by_status", ["status"]),
});
