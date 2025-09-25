import { v } from "convex/values";
import { Id } from "../_generated/dataModel";
import { internalApiMutation } from "../helpers";

// Create a new thread
export const createThread = internalApiMutation({
  args: {
    userId: v.string(),
    threadId: v.string(),
    title: v.string(),
    model: v.string(),
  },
  handler: async (ctx, args) => {
    const targetUserId = args.userId as Id<"users">;

    // Check if thread already exists
    const existingThread = await ctx.db
      .query("threads")
      .withIndex("by_thread_id", (q) => q.eq("threadId", args.threadId))
      .first();

    if (existingThread) {
      if (existingThread.userId !== targetUserId) {
        throw new Error("Unauthorized");
      }
      // Thread already exists, just return success
      return { threadId: args.threadId, existed: true };
    }

    const now = Date.now();

    await ctx.db.insert("threads", {
      threadId: args.threadId,
      title: args.title,
      userId: targetUserId,
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
