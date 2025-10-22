import {
  mutation,
  action,
  internalAction,
  internalMutation,
  internalQuery,
} from "./_generated/server";
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  HeadObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { v } from "convex/values";
import { authComponent } from "./auth";
import { internal } from "./_generated/api";
import type { Id } from "./_generated/dataModel";

/**
 * Create R2 client with credentials from environment variables.
 * This runs server-side in Convex (Node.js environment).
 * Single instance created once when module loads.
 */
const r2Client = (() => {
  const config = {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
    bucket: process.env.R2_BUCKET,
    endpoint: process.env.R2_ENDPOINT,
  };

  // Validate all required env vars are present
  const missing = Object.entries(config)
    .filter(([, value]) => !value)
    .map(([key]) => key);

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(", ")}`,
    );
  }

  return {
    client: new S3Client({
      region: "auto",
      endpoint: config.endpoint!,
      credentials: {
        accessKeyId: config.accessKeyId!,
        secretAccessKey: config.secretAccessKey!,
      },
    }),
    bucket: config.bucket!,
  };
})();

/**
 * Generate public URL for an uploaded file
 */
const getPublicUrl = (key: string): string => {
  const publicUrl = process.env.NEXT_PUBLIC_R2_PUBLIC_URL;
  if (!publicUrl) {
    throw new Error("NEXT_PUBLIC_R2_PUBLIC_URL not set");
  }
  return `${publicUrl}/${key}`;
};

/**
 * Generate a presigned URL for uploading a file to R2
 *
 * Returns:
 * - uploadUrl: Presigned PUT URL (expires in 1 hour)
 * - key: Unique file identifier (UUID)
 * - publicUrl: Permanent public URL (domain/key)
 */
export const generateUploadUrl = mutation({
  args: {
    fileName: v.string(),
    fileType: v.string(),
    fileSize: v.number(),
  },
  handler: async (ctx, args) => {
    // 1. Check authentication
    const authUser = await authComponent.safeGetAuthUser(ctx);
    if (!authUser) {
      throw new Error("User not authenticated");
    }

    // 2. Validate file size
    const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB
    if (args.fileSize > MAX_FILE_SIZE) {
      throw new Error(`File too large. Maximum size is ${MAX_FILE_SIZE} bytes`);
    }

    // 3. Use R2 client
    const { client, bucket } = r2Client;

    // 4. Generate unique key for the file
    const key = crypto.randomUUID();

    // 5. Create presigned URL for PUT operation
    const command = new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      ContentType: args.fileType,
      // Note: ACL must be set on the bucket level for R2
      // Set your bucket to allow public reads in Cloudflare dashboard
    });

    const uploadUrl = await getSignedUrl(client, command, {
      expiresIn: 3600, // 1 hour
    });

    // 6. Create pending attachment record
    const attachmentId = await ctx.db.insert("attachments", {
      key: key,
      filename: args.fileName,
      mediaType: args.fileType,
      url: getPublicUrl(key),
      size: args.fileSize,
      status: "pending",
      createdAt: Date.now(),
      userId: authUser.userId as Id<"users">,
      // threadId is optional - will be set when attached to a message
    });

    // 7. Return URLs to client
    return {
      attachmentId,
      uploadUrl,
      key,
      publicUrl: getPublicUrl(key),
    };
  },
});

/**
 * Internal query to get attachment by ID
 */
export const getAttachment = internalQuery({
  args: { attachmentId: v.id("attachments") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.attachmentId);
  },
});

/**
 * Confirm file upload and validate actual file size using HEAD command
 * Called by client after successful upload to R2
 *
 * This action:
 * 1. Gets actual file size from R2 using HeadObjectCommand
 * 2. If size exceeds limit: deletes file from R2 and attachment record, returns passed_validation: false
 * 3. If size is valid: updates attachment status to "uploaded", returns passed_validation: true
 *
 * Note: Does not throw on validation failure - caller should check passed_validation
 */
export const confirmUpload = action({
  args: {
    attachmentId: v.id("attachments"),
  },
  returns: v.object({
    passed_validation: v.boolean(),
  }),
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized");
    }

    const { client, bucket } = r2Client;
    const MAX_FILE_SIZE = 15 * 1024 * 1024; // 15MB

    // 1. Get the attachment record
    const attachment = await ctx.runQuery(internal.files.getAttachment, {
      attachmentId: args.attachmentId,
    });

    if (!attachment) {
      throw new Error("Attachment not found");
    }

    // 2. Check if already confirmed
    if (attachment.status === "uploaded") {
      return { passed_validation: true };
    }

    const key = attachment.key;

    // 3. Get actual file metadata from R2
    const headCommand: HeadObjectCommand = new HeadObjectCommand({
      Bucket: bucket,
      Key: key,
    });
    const metadata = await client.send(headCommand);
    const actualSize: number = metadata.ContentLength || 0;

    // 4. Check if file exceeds size limit
    if (actualSize > MAX_FILE_SIZE) {
      // Delete attachment record first
      await ctx.runMutation(internal.files.deleteAttachment, {
        attachmentId: args.attachmentId,
      });

      // Then delete from R2
      const deleteCommand = new DeleteObjectCommand({
        Bucket: bucket,
        Key: key,
      });
      await client.send(deleteCommand);

      // Return validation failure (don't throw - let caller handle)
      return { passed_validation: false };
    }

    // 5. Mark as uploaded (we no longer persist actual size)
    await ctx.runMutation(internal.files.updateAttachment, {
      attachmentId: args.attachmentId,
      status: "uploaded",
      uploadedAt: Date.now(),
    });

    return { passed_validation: true };
  },
});

/**
 * Delete a file from R2 and remove metadata
 */
export const deleteFile = mutation({
  args: {
    key: v.string(),
  },
  handler: async (ctx, args) => {
    // 1. Check authentication
    const authUser = await authComponent.safeGetAuthUser(ctx);
    if (!authUser) {
      throw new Error("User not authenticated");
    }

    // 2. Find the attachment
    const attachment = await ctx.db
      .query("attachments")
      .withIndex("by_key", (q) => q.eq("key", args.key))
      .first();

    if (!attachment) {
      throw new Error("File not found");
    }

    // 3. Check authorization
    if (attachment.userId !== authUser.userId) {
      throw new Error("Unauthorized");
    }

    // 4. Delete from Convex database
    await ctx.db.delete(attachment._id);

    // 5. Schedule R2 deletion as action (runs in background)
    await ctx.scheduler.runAfter(0, internal.files.deleteFromR2, {
      key: args.key,
    });

    return { success: true };
  },
});

/**
 * Internal mutation to delete attachment record
 */
export const deleteAttachment = internalMutation({
  args: { attachmentId: v.id("attachments") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.attachmentId);
  },
});

/**
 * Internal mutation to update attachment status and size
 */
export const updateAttachment = internalMutation({
  args: {
    attachmentId: v.id("attachments"),
    status: v.union(v.literal("pending"), v.literal("uploaded")),
    uploadedAt: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const updates: {
      status: "pending" | "uploaded";
      uploadedAt?: number;
    } = { status: args.status };

    if (args.uploadedAt !== undefined) {
      updates.uploadedAt = args.uploadedAt;
    }

    await ctx.db.patch(args.attachmentId, updates);
  },
});

/**
 * Internal action to delete file from R2 storage
 * Scheduled by deleteFile mutation
 */
export const deleteFromR2 = internalAction({
  args: { key: v.string() },
  handler: async (_ctx, args) => {
    const { client, bucket } = r2Client;

    const command = new DeleteObjectCommand({
      Bucket: bucket,
      Key: args.key,
    });

    await client.send(command);
  },
});
