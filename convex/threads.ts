import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { paginationOptsValidator } from "convex/server";
import { authComponent } from "./auth";
import { Id } from "./_generated/dataModel";

export const getUserThreads = query({
  args: { paginationOpts: paginationOptsValidator },
  handler: async (ctx, args) => {
    const authUser = await authComponent.safeGetAuthUser(ctx);
    const userId = authUser?.userId as Id<"users"> | null;
    if (!userId) {
      return { page: [], isDone: true, continueCursor: null };
    }

    return await ctx.db
      .query("threads")
      .withIndex("by_user_last_message", (q) => q.eq("userId", userId))
      .order("desc")
      .paginate(args.paginationOpts);
  },
});

export const getThreadById = query({
  args: { threadId: v.string() },
  handler: async (ctx, args) => {
    const authUser = await authComponent.safeGetAuthUser(ctx);
    const userId = authUser?.userId as Id<"users"> | null;
    if (!userId) {
      return null;
    }

    const thread = await ctx.db
      .query("threads")
      .withIndex("by_thread_id", (q) => q.eq("threadId", args.threadId))
      .first();

    if (!thread) {
      return null;
    }

    // Check if user has access to this thread
    if (thread.userId !== userId) {
      return null;
    }

    return thread;
  },
});

// Search threads by title
export const searchThreads = query({
  args: {
    searchQuery: v.string(),
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, args) => {
    const authUser = await authComponent.safeGetAuthUser(ctx);
    const userId = authUser?.userId as Id<"users"> | null;
    if (!userId) {
      return { page: [], isDone: true, continueCursor: null };
    }

    const trimmedQuery = args.searchQuery.trim();
    if (!trimmedQuery) {
      return { page: [], isDone: true, continueCursor: null };
    }

    return await ctx.db
      .query("threads")
      .withSearchIndex("search_title", (q) =>
        q.search("title", trimmedQuery).eq("userId", userId),
      )
      .paginate(args.paginationOpts);
  },
});

// Create a new thread
export const createThread = mutation({
  args: {
    threadId: v.string(),
    title: v.string(),
    model: v.string(),
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

    return { threadId: args.threadId, existed: false };
  },
});

// Update thread (flexible - can update multiple fields)
export const updateThread = mutation({
  args: {
    threadId: v.string(),
    title: v.optional(v.string()),
    model: v.optional(v.string()),
    pinned: v.optional(v.boolean()),
    generationStatus: v.optional(
      v.union(
        v.literal("submitted"),
        v.literal("streaming"),
        v.literal("ready"),
        v.literal("error"),
      ),
    ),
  },
  handler: async (ctx, args) => {
    const authUser = await authComponent.safeGetAuthUser(ctx);
    const userId = authUser?.userId as Id<"users"> | null;
    if (!userId) {
      throw new Error("User not authenticated");
    }

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

    // Build update object with only provided fields
    const updateData: {
      updatedAt: number;
      title?: string;
      userSetTitle?: boolean;
      model?: string;
      pinned?: boolean;
      generationStatus?: "submitted" | "streaming" | "ready" | "error";
    } = {
      updatedAt: Date.now(),
    };

    if (args.title !== undefined) {
      updateData.title = args.title;
      updateData.userSetTitle = true;
    }
    if (args.model !== undefined) {
      updateData.model = args.model;
    }
    if (args.pinned !== undefined) {
      updateData.pinned = args.pinned;
    }
    if (args.generationStatus !== undefined) {
      updateData.generationStatus = args.generationStatus;
    }

    await ctx.db.patch(thread._id, updateData);
  },
});

// Update thread title
export const updateThreadTitle = mutation({
  args: {
    threadId: v.string(),
    title: v.string(),
  },
  handler: async (ctx, args) => {
    const authUser = await authComponent.safeGetAuthUser(ctx);
    const userId = authUser?.userId as Id<"users"> | null;
    if (!userId) {
      throw new Error("User not authenticated");
    }

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

    await ctx.db.patch(thread._id, {
      title: args.title,
      updatedAt: Date.now(),
      userSetTitle: true,
    });
  },
});

// Toggle thread pinned status
export const toggleThreadPinned = mutation({
  args: {
    threadId: v.string(),
  },
  handler: async (ctx, args) => {
    const authUser = await authComponent.safeGetAuthUser(ctx);
    const userId = authUser?.userId as Id<"users"> | null;
    if (!userId) {
      throw new Error("User not authenticated");
    }

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

    await ctx.db.patch(thread._id, {
      pinned: !thread.pinned,
      updatedAt: Date.now(),
    });
  },
});

// Delete thread
export const deleteThread = mutation({
  args: {
    threadId: v.string(),
  },
  handler: async (ctx, args) => {
    const authUser = await authComponent.safeGetAuthUser(ctx);
    const userId = authUser?.userId as Id<"users"> | null;
    if (!userId) {
      throw new Error("User not authenticated");
    }

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

    await ctx.db.delete(thread._id);
  },
});
