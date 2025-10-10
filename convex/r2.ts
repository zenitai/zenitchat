import { R2 } from "@convex-dev/r2";
import { components } from "./_generated/api";
import { authComponent } from "./auth";
import { mutation } from "./_generated/server";
import { v } from "convex/values";
import type { Id } from "./_generated/dataModel";

export const r2 = new R2(components.r2);

export const { generateUploadUrl, syncMetadata, onSyncMetadata } = r2.clientApi(
  {
    checkUpload: async (ctx) => {
      // Validate user is authenticated before allowing upload
      const identity = await ctx.auth.getUserIdentity();
      if (!identity) {
        throw new Error("User not authenticated");
      }
      // Additional validation could go here:
      // - Check user storage quota
      // - Check user permissions
      // - Rate limiting
    },

    onUpload: async (ctx, bucket, key) => {
      // This callback runs AFTER file is uploaded to R2
      // Get file metadata from R2
      const metadata = await r2.getMetadata(ctx, key);

      // Get authenticated user
      const authUser = await authComponent.safeGetAuthUser(ctx);
      const userId = authUser?.userId as Id<"users"> | null;

      if (!userId) {
        throw new Error("User not authenticated");
      }

      if (!metadata) {
        throw new Error("Failed to get file metadata");
      }

      // Create attachment record in database
      await ctx.db.insert("attachments", {
        attachmentId: key,
        filename: key.split("/").pop() || key, // Will be overwritten
        mediaType: metadata.contentType || "application/octet-stream",
        url: getPublicUrl(key),
        size: metadata.size || 0,
        uploadedAt: Date.now(),
        userId,
        // threadId is optional - set later when message is created
      });

      // Note: The R2 hook will return the key to the client
      // Client can then construct the FilePart with this key
    },
  },
);

// Helper function to generate public R2 URLs
export const getPublicUrl = (key: string): string => {
  const domain = process.env.NEXT_PUBLIC_R2_PUBLIC_DOMAIN;
  if (!domain) {
    throw new Error(
      "NEXT_PUBLIC_R2_PUBLIC_DOMAIN environment variable not set in Convex",
    );
  }
  return `https://${domain}/${key}`;
};

// Delete a file from R2 storage
export const deleteFile = mutation({
  args: { key: v.string() },
  handler: async (ctx, { key }) => {
    const authUser = await authComponent.safeGetAuthUser(ctx);
    if (!authUser) {
      throw new Error("User not authenticated");
    }

    const attachment = await ctx.db
      .query("attachments")
      .filter((q) => q.eq(q.field("attachmentId"), key))
      .first();

    if (!attachment) {
      throw new Error("File not found");
    }

    if (attachment.userId !== authUser.userId) {
      throw new Error("Unauthorized");
    }

    await r2.deleteObject(ctx, key);
    await ctx.db.delete(attachment._id);

    return { success: true };
  },
});
