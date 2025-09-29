import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { authComponent } from "./auth";
import { Id } from "./_generated/dataModel";
import {
  messageParts,
  messageErrors,
  messageMetadata,
  MessageParts,
  MessageMetadata,
  MessageErrors,
} from "./schema/messages";

// Get messages for a specific thread
export const getThreadMessages = query({
  args: {
    threadId: v.string(),
  },
  handler: async (ctx, args) => {
    const authUser = await authComponent.safeGetAuthUser(ctx);
    const userId = authUser?.userId as Id<"users"> | null;
    if (!userId) {
      return [];
    }

    // First verify the thread belongs to the user
    const thread = await ctx.db
      .query("threads")
      .withIndex("by_thread_id", (q) => q.eq("threadId", args.threadId))
      .first();

    if (!thread) {
      return [];
    }

    if (thread.userId !== userId) {
      return [];
    }

    return await ctx.db
      .query("messages")
      .withIndex("by_thread_created", (q) => q.eq("threadId", args.threadId))
      .order("asc")
      .collect();
  },
});

// Add multiple messages to a thread
export const addMessagesToThread = mutation({
  args: {
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
    const authUser = await authComponent.safeGetAuthUser(ctx);
    const userId = authUser?.userId as Id<"users"> | null;
    if (!userId) {
      throw new Error("User not authenticated");
    }

    // Verify thread ownership
    const thread = await ctx.db
      .query("threads")
      .withIndex("by_thread_id", (q) => q.eq("threadId", args.threadId))
      .first();

    if (!thread) {
      throw new Error("Thread not found");
    }

    if (thread.userId !== userId) {
      throw new Error("Unauthorized");
    }

    const now = Date.now();

    // Insert all messages
    for (const message of args.messages) {
      await ctx.db.insert("messages", {
        messageId: message.messageId,
        threadId: args.threadId,
        userId,
        role: message.role,
        parts: message.parts,
        createdAt: now,
        updatedAt: now,
        generationStatus: message.generationStatus || "submitted",
        attachmentIds: message.attachmentIds || [],
        metadata: message.metadata,
      });
    }

    // Update thread's lastMessageAt and generation status
    await ctx.db.patch(thread._id, {
      lastMessageAt: now,
      updatedAt: now,
      generationStatus: "submitted",
    });

    return { success: true };
  },
});

// Update message with error
export const setMessageError = mutation({
  args: {
    messageId: v.string(),
    errors: messageErrors,
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

    // Update the message with errors
    await ctx.db.patch(message._id, {
      errors: args.errors,
      generationStatus: "error",
      updatedAt: Date.now(),
    });

    // Update the thread status to error
    const thread = await ctx.db
      .query("threads")
      .withIndex("by_thread_id", (q) => q.eq("threadId", message.threadId))
      .first();

    if (thread && thread.userId === userId) {
      await ctx.db.patch(thread._id, {
        generationStatus: "error",
        updatedAt: Date.now(),
      });
    }

    return { success: true };
  },
});

// Update message
export const updateMessage = mutation({
  args: {
    messageId: v.string(),
    threadId: v.optional(v.string()),
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
    metadata: v.optional(messageMetadata),
    errors: v.optional(messageErrors),
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
      errors?: MessageErrors;
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
    if (args.errors !== undefined) {
      updateData.errors = args.errors;
    }

    // Update the message
    await ctx.db.patch(message._id, updateData);

    // Update thread status if threadId is provided and generationStatus changed
    if (args.threadId && args.generationStatus !== undefined) {
      const thread = await ctx.db
        .query("threads")
        .withIndex("by_thread_id", (q) => q.eq("threadId", args.threadId!))
        .first();

      if (thread && thread.userId === userId) {
        await ctx.db.patch(thread._id, {
          generationStatus: args.generationStatus,
          updatedAt: Date.now(),
        });
      }
    }

    return { success: true };
  },
});

// Create thread and add messages in a single operation (for new threads)
export const createThreadWithMessages = mutation({
  args: {
    threadId: v.string(),
    title: v.string(),
    model: v.string(),
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
    const authUser = await authComponent.safeGetAuthUser(ctx);
    const userId = authUser?.userId as Id<"users"> | null;
    if (!userId) {
      throw new Error("User not authenticated");
    }

    // Check if thread already exists
    const existingThread = await ctx.db
      .query("threads")
      .withIndex("by_thread_id", (q) => q.eq("threadId", args.threadId))
      .first();

    if (existingThread) {
      // Thread already exists, just return success
      return { threadId: args.threadId, existed: true };
    }

    const now = Date.now();

    // Create thread
    await ctx.db.insert("threads", {
      threadId: args.threadId,
      title: args.title,
      userId,
      model: args.model,
      createdAt: now,
      updatedAt: now,
      lastMessageAt: now,
      generationStatus: "submitted",
      userSetTitle: false,
      pinned: false,
    });

    // Insert all messages
    for (const message of args.messages) {
      await ctx.db.insert("messages", {
        messageId: message.messageId,
        threadId: args.threadId,
        userId,
        role: message.role,
        parts: message.parts,
        createdAt: now,
        updatedAt: now,
        generationStatus: message.generationStatus || "submitted",
        attachmentIds: message.attachmentIds || [],
        metadata: message.metadata,
      });
    }

    return { threadId: args.threadId, existed: false };
  },
});
