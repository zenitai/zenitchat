import { Effect, Data, Context } from "effect";
import type { ConvexReactClient } from "convex/react";
import { api } from "@/convex/_generated/api";

// Error types for R2 operations
export class R2UploadFailedError extends Data.TaggedError(
  "R2UploadFailedError",
)<{
  readonly filename: string;
  readonly message: string; // User-friendly message
  readonly originalError: string; // Technical details
}> {}

export class R2DeleteFailedError extends Data.TaggedError(
  "R2DeleteFailedError",
)<{
  readonly key: string;
  readonly message: string; // User-friendly message
  readonly originalError: string; // Technical details
}> {}

/**
 * Context.Tag for ConvexReactClient
 * This allows us to inject the Convex client as a dependency
 */
export class ConvexClient extends Context.Tag("ConvexClient")<
  ConvexClient,
  ConvexReactClient
>() {}

/**
 * R2 File Upload Service
 *
 * This service handles file uploads to Cloudflare R2 using presigned URLs.
 *
 * ### Usage Example:
 *
 * ```typescript
 * import { useConvex } from "convex/react";
 * import { Effect } from "effect";
 * import { R2Service, makeConvexLayer } from "@/services/r2";
 *
 * const MyComponent = () => {
 *   const convex = useConvex();
 *
 *   const handleUpload = (file: File) => {
 *     const program = Effect.gen(function* () {
 *       const r2 = yield* R2Service;
 *       const result = yield* r2.uploadFile(file);
 *       console.log("Uploaded:", result.publicUrl);
 *       return result;
 *     });
 *
 *     Effect.runPromise(
 *       program.pipe(
 *         Effect.provide(R2Service.Default),
 *         Effect.provide(makeConvexLayer(convex))
 *       )
 *     );
 *   };
 * };
 * ```
 */
export class R2Service extends Effect.Service<R2Service>()("R2Service", {
  effect: Effect.gen(function* () {
    // Yield dependencies from context
    const convex = yield* ConvexClient;

    return {
      /**
       * Upload a file to R2
       *
       * Steps:
       * 1. Call Convex mutation to get presigned URL
       * 2. Upload file directly to R2 using presigned URL
       * 3. Return public URL
       */
      uploadFile: (file: File) =>
        Effect.gen(function* () {
          // Step 1: Get presigned upload URL from Convex
          const { uploadUrl, key, publicUrl } = yield* Effect.tryPromise({
            try: () =>
              convex.mutation(api.files.generateUploadUrl, {
                fileName: file.name,
                fileType: file.type,
                fileSize: file.size,
              }),
            catch: (error) =>
              new R2UploadFailedError({
                filename: file.name,
                message: `Unable to prepare upload for "${file.name}"`,
                originalError: String(error),
              }),
          });

          // Step 2: Upload file to R2 using presigned URL
          // Use raw fetch (like R2 component) - browser handles streaming automatically
          yield* Effect.tryPromise({
            try: async () => {
              const response = await fetch(uploadUrl, {
                method: "PUT",
                headers: { "Content-Type": file.type },
                body: file,
              });

              if (!response.ok) {
                throw new Error(`Upload failed: ${response.status}`);
              }
            },
            catch: (error) =>
              new R2UploadFailedError({
                filename: file.name,
                message: `Failed to upload file "${file.name}"`,
                originalError: String(error),
              }),
          });

          // Step 3: Return the result
          return { key, publicUrl };
        }),

      /**
       * Delete a file from R2
       */
      deleteFile: (key: string) =>
        Effect.gen(function* () {
          yield* Effect.tryPromise({
            try: () => convex.mutation(api.files.deleteFile, { key }),
            catch: (error) =>
              new R2DeleteFailedError({
                key,
                message: "Unable to delete file",
                originalError: String(error),
              }),
          });

          return { success: true };
        }),
    };
  }),
}) {}

/**
 * Helper to create a Layer that provides ConvexClient
 *
 * Usage in hooks:
 * ```typescript
 * const convex = useConvex();
 * const convexLayer = makeConvexLayer(convex);
 *
 * Effect.runFork(
 *   program.pipe(
 *     Effect.provide(R2Service.Default),
 *     Effect.provide(convexLayer)
 *   )
 * );
 * ```
 */
export const makeConvexLayer = (convex: ConvexReactClient) =>
  Context.make(ConvexClient, convex);
