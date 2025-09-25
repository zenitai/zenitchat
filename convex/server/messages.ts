import { Infer, v } from "convex/values";
import { messageParts } from "../schema";
import { Id } from "../_generated/dataModel";
import { internalApiMutation } from "../helpers";
import { mutation } from "../_generated/server";
import { authComponent } from "../auth";

// Type for message parts
type MessageParts = Infer<typeof messageParts>;

// Type for message metadata
type MessageMetadata = {
  model?: string;
  providerOptions?: unknown;
  tokens?: {
    input?: number;
    reasoning?: number;
    output?: number;
    total?: number;
  };
};

// Add multiple messages to a thread
export const addMessagesToThread = internalApiMutation({
  args: {
    userId: v.string(),
    threadId: v.string(),
    messages: v.array(
      v.object({
        messageId: v.string(),
        role: v.union(
          v.literal("user"),
          v.literal("assistant"),
          v.literal("system"),
        ),
        parts: messageParts,
        generationStatus: v.optional(
          v.union(
            v.literal("submitted"),
            v.literal("streaming"),
            v.literal("ready"),
            v.literal("error"),
          ),
        ),
        attachmentIds: v.optional(v.array(v.string())),
        metadata: v.optional(
          v.object({
            model: v.optional(v.string()),
            providerOptions: v.optional(v.any()),
          }),
        ),
      }),
    ),
  },
  handler: async (ctx, args) => {
    const targetUserId = args.userId as Id<"users">;

    // Verify thread ownership
    const thread = await ctx.db
      .query("threads")
      .withIndex("by_thread_id", (q) => q.eq("threadId", args.threadId))
      .first();

    if (!thread) {
      throw new Error("Thread not found");
    }

    if (thread.userId !== targetUserId) {
      throw new Error("Unauthorized");
    }

    const now = Date.now();

    // Insert all messages
    for (const message of args.messages) {
      await ctx.db.insert("messages", {
        messageId: message.messageId,
        threadId: args.threadId,
        userId: targetUserId,
        role: message.role,
        parts: message.parts,
        createdAt: now,
        updatedAt: now,
        generationStatus: message.generationStatus || "submitted",
        attachmentIds: message.attachmentIds || [],
        metadata: message.metadata,
      });
    }

    // Update thread's lastMessageAt to the latest
    await ctx.db.patch(thread._id, {
      lastMessageAt: now,
      updatedAt: now,
    });

    return { success: true };
  },
});

// Update message
export const updateMessage = mutation({
  args: {
    messageId: v.string(),
    parts: v.optional(messageParts),
    generationStatus: v.optional(
      v.union(
        v.literal("submitted"),
        v.literal("streaming"),
        v.literal("ready"),
        v.literal("error"),
      ),
    ),
    attachmentIds: v.optional(v.array(v.string())),
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
      }),
    ),
  },
  handler: async (ctx, args) => {
    const authUser = await authComponent.safeGetAuthUser(ctx);
    const userId = authUser?.userId as Id<"users"> | null;
    if (!userId) {
      throw new Error("User not authenticated");
    }

    // Find the message
    const message = await ctx.db
      .query("messages")
      .withIndex("by_message_id", (q) => q.eq("messageId", args.messageId))
      .first();

    if (!message) {
      throw new Error("Message not found");
    }

    // Verify ownership
    if (message.userId !== userId) {
      throw new Error("Unauthorized");
    }

    // Build update object with only provided fields
    const updateData: {
      updatedAt: number;
      parts?: MessageParts;
      generationStatus?: "submitted" | "streaming" | "ready" | "error";
      attachmentIds?: string[];
      metadata?: MessageMetadata;
    } = {
      updatedAt: Date.now(),
    };

    if (args.parts !== undefined) {
      updateData.parts = args.parts;
    }
    if (args.generationStatus !== undefined) {
      updateData.generationStatus = args.generationStatus;
    }
    if (args.attachmentIds !== undefined) {
      updateData.attachmentIds = args.attachmentIds;
    }
    if (args.metadata !== undefined) {
      updateData.metadata = args.metadata;
    }

    // Update the message
    await ctx.db.patch(message._id, updateData);

    return { success: true };
  },
});
