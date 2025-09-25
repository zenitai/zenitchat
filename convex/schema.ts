import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

// Message parts validator - reusable validator for message parts
export const messageParts = v.array(
  v.union(
    // Text part
    v.object({
      type: v.literal("text"),
      text: v.string(),
      state: v.optional(v.union(v.literal("streaming"), v.literal("done"))),
      providerMetadata: v.optional(v.any()),
    }),
    // Reasoning part
    v.object({
      type: v.literal("reasoning"),
      text: v.string(),
      state: v.optional(v.union(v.literal("streaming"), v.literal("done"))),
      providerMetadata: v.optional(v.any()),
    }),
    // Tool part
    v.object({
      type: v.string(), // Will be "tool-{name}" format
      toolCallId: v.string(),
      state: v.union(
        v.literal("input-streaming"),
        v.literal("input-available"),
        v.literal("output-available"),
        v.literal("output-error"),
      ),
      input: v.any(),
      output: v.optional(v.any()),
      errorText: v.optional(v.string()),
      providerExecuted: v.optional(v.boolean()),
    }),
    // SourceUrl part
    v.object({
      type: v.literal("source-url"),
      sourceId: v.string(),
      url: v.string(),
      title: v.optional(v.string()),
      providerMetadata: v.optional(v.any()),
    }),
    // SourceDocument part
    v.object({
      type: v.literal("source-document"),
      sourceId: v.string(),
      mediaType: v.string(),
      title: v.string(),
      filename: v.optional(v.string()),
      providerMetadata: v.optional(v.any()),
    }),
    // File part
    v.object({
      type: v.literal("file"),
      mediaType: v.string(),
      filename: v.optional(v.string()),
      url: v.string(),
    }),
    // Data part
    v.object({
      type: v.string(), // Will be "data-{name}" format
      id: v.optional(v.string()),
      data: v.any(),
    }),
    // StepStart part
    v.object({
      type: v.literal("step-start"),
    }),
  ),
);

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
    .index("by_message_id", ["messageId"])
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
