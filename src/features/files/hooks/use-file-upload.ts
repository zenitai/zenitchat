import { useState, useCallback } from "react";
import { useUploadFile } from "@convex-dev/r2/react";
import { toast } from "sonner";
import { Effect } from "effect";
import { api } from "@/convex/_generated/api";
import { validateFiles } from "../utils";
import { env } from "@/env";
import {
  FileUploadError,
  type FileItem,
  type FileValidationConfig,
  type UseFileUploadReturn,
} from "../types";

export const useFileUpload = (
  config: FileValidationConfig,
): UseFileUploadReturn => {
  const [files, setFiles] = useState<FileItem[]>([]);
  const uploadFile = useUploadFile(api.r2);

  // Add files and start uploading with Effect.ts
  const addFiles = useCallback(
    (newFiles: FileList | File[]) => {
      const fileArray = Array.from(newFiles);

      // Upload files with Effect.ts
      const uploadEffect = Effect.gen(function* () {
        // Handle truncation logic
        const maxAllowed = config.maxFiles
          ? config.maxFiles - files.length
          : fileArray.length;
        const filesToUpload = fileArray.slice(0, maxAllowed);
        const truncatedCount = fileArray.length - filesToUpload.length;

        // Show toast if files were truncated
        if (truncatedCount > 0) {
          yield* Effect.sync(() => {
            toast.warning(
              `${truncatedCount} files were removed because they exceed the maximum limit of ${config.maxFiles} files`,
            );
          });
        }

        // Create FileItem for each file with "uploading" status
        const newFileItems: FileItem[] = yield* Effect.sync(() =>
          filesToUpload.map((file) => ({
            id: crypto.randomUUID(),
            filename: file.name,
            mediaType: file.type,
            url: undefined,
            status: "uploading" as const,
          })),
        );

        // Add to state immediately
        yield* Effect.sync(() => {
          setFiles((prev) => [...prev, ...newFileItems]);
        });

        // Validate files
        yield* validateFiles(filesToUpload, config);

        // Upload files concurrently
        yield* Effect.forEach(
          filesToUpload.map((file, index) => ({
            file,
            fileItem: newFileItems[index],
          })),
          ({ file, fileItem }) =>
            Effect.gen(function* () {
              // Upload to R2
              const key = yield* Effect.tryPromise({
                try: () => uploadFile(file),
                catch: (error) =>
                  new FileUploadError({
                    filename: file.name,
                    message: `Failed to upload ${file.name}: ${error}`,
                  }),
              }).pipe(
                Effect.retry({ times: 2 }),
                Effect.tapError(() =>
                  Effect.sync(() => {
                    // Remove failed file from state
                    setFiles((prev) =>
                      prev.filter((f) => f.id !== fileItem.id),
                    );
                  }),
                ),
              );

              // Construct public URL
              const url = `https://${env.NEXT_PUBLIC_R2_PUBLIC_DOMAIN}/${key}`;

              // Update state with completed upload
              yield* Effect.sync(() =>
                setFiles((prev) =>
                  prev.map((f) =>
                    f.id === fileItem.id
                      ? { ...f, url, status: "complete" as const }
                      : f,
                  ),
                ),
              );
            }),
          { concurrency: "unbounded" },
        );
      }).pipe(
        Effect.catchTags({
          FileValidationError: (error) =>
            Effect.sync(() => toast.error(error.message)),
          FileUploadError: (error) =>
            Effect.sync(() => toast.error(error.message)),
        }),
      );

      // Run the upload effect in background
      Effect.runFork(uploadEffect);
    },
    [files.length, config, uploadFile],
  );

  // Remove file from state (delete immediately in chat input)
  const removeFile = useCallback((id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));

    // TODO: Delete from R2 if needed
    // For now, files stay in R2 even if removed from UI
    // Cleanup can be handled separately
  }, []);

  // Mark file for deletion (used in message editing)
  const markForDeletion = useCallback((id: string) => {
    setFiles((prev) =>
      prev.map((f) =>
        f.id === id ? { ...f, status: "marked-for-deletion" as const } : f,
      ),
    );
  }, []);

  // Restore file that was marked for deletion
  const restoreFile = useCallback((id: string) => {
    setFiles((prev) =>
      prev.map((f) =>
        f.id === id ? { ...f, status: "complete" as const } : f,
      ),
    );
  }, []);

  // Clear all files
  const clearFiles = useCallback(() => {
    setFiles([]);
  }, []);

  return {
    files,
    addFiles,
    removeFile,
    markForDeletion,
    restoreFile,
    clearFiles,
  };
};
