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
    branchParentThreadId: v.optional(v.id("threads")),
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
    parts: v.array(
      v.union(
        // Text part
        v.object({
          type: v.literal("text"),
          text: v.string(),
        }),
        // Reasoning part
        v.object({
          type: v.literal("reasoning"),
          reasoningText: v.string(),
        }),
        // File part
        v.object({
          type: v.literal("file"),
          mediaType: v.string(),
          filename: v.optional(v.string()),
          url: v.string(),
        }),
        // Tool call part
        v.object({
          type: v.literal("tool-call"),
          toolCallId: v.string(),
          toolName: v.string(),
          input: v.any(),
        }),
        // Tool result part with AI SDK standard states
        v.object({
          type: v.literal("tool-result"),
          toolCallId: v.string(),
          toolName: v.string(),
          state: v.union(
            v.literal("input-streaming"),
            v.literal("input-available"),
            v.literal("output-streaming"),
            v.literal("output-available"),
            v.literal("output-error"),
          ),
          input: v.any(),
          output: v.optional(v.any()),
          errorText: v.optional(v.string()),
          providerExecuted: v.optional(v.boolean()),
        }),
        // Image part
        v.object({
          type: v.literal("image"),
          image: v.string(), // base64 or URL
          mediaType: v.optional(v.string()),
        }),
        // Data part for custom content
        v.object({
          type: v.literal("data"),
          data: v.any(),
          id: v.optional(v.string()),
        }),
      ),
    ),
    createdAt: v.number(),
    updatedAt: v.number(),
    generationStatus: v.union(
      v.literal("submitted"),
      v.literal("streaming"),
      v.literal("ready"),
      v.literal("error"),
    ),
    error: v.optional(
      v.object({
        type: v.union(
          v.literal("model_error"),
          v.literal("network_error"),
          v.literal("validation_error"),
          v.literal("provider_error"),
          v.literal("rate_limit"),
          v.literal("timeout"),
          v.literal("unknown"),
        ),
        message: v.string(),
        code: v.optional(v.string()),
        details: v.optional(v.any()),
        timestamp: v.optional(v.number()),
      }),
    ),
    metadata: v.optional(
      v.object({
        model: v.optional(v.string()),
        providerOptions: v.optional(v.any()),
        tokens: v.optional(
          v.object({
            input: v.optional(v.number()),
            reasoning: v.optional(v.number()),
            output: v.optional(v.number()),
            total: v.optional(v.number()),
          }),
        ),
        // Additional metadata can be added here
      }),
    ),
    attachmentIds: v.optional(v.array(v.string())),
  })
    .index("by_thread", ["threadId"])
    .index("by_thread_created", ["threadId", "createdAt"])
    .index("by_user", ["userId"]),
  attachments: defineTable({
    attachmentId: v.string(),
    filename: v.string(),
    mediaType: v.string(),
    url: v.string(),
    size: v.number(),
    uploadedAt: v.number(),
    userId: v.id("users"),
    threadId: v.optional(v.string()),
  })
    .index("by_user", ["userId"])
    .index("by_attachment_id", ["attachmentId"])
    .index("by_thread", ["threadId"]),
});
