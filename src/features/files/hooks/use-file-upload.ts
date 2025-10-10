import { useState, useCallback } from "react";
import { useUploadFile } from "@convex-dev/r2/react";
import { toast } from "sonner";
import { Effect, Either } from "effect";
import { api } from "@/convex/_generated/api";
import { validateFile } from "../utils";
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
        const currentCount = files.length;
        const maxAllowed =
          config.maxFiles != null
            ? Math.max(0, config.maxFiles - currentCount)
            : fileArray.length;
        const filesToUpload = fileArray.slice(0, maxAllowed);
        const truncatedCount = fileArray.length - filesToUpload.length;

        // Show toast if files were truncated
        if (truncatedCount > 0) {
          yield* Effect.sync(() => {
            if (maxAllowed === 0) {
              // Already at capacity - no files can be uploaded
              toast.warning(
                `Couldn't upload more files. Limit is ${config.maxFiles} files`,
              );
            } else {
              // Some files uploaded, some truncated
              toast.warning(
                `${truncatedCount} files were not uploaded because they exceed the maximum limit of ${config.maxFiles} files`,
              );
            }
          });
        }

        // Filter out duplicate files
        const existingFiles = files;
        const uniqueFiles: File[] = [];
        const duplicates: string[] = [];

        yield* Effect.forEach(filesToUpload, (file) =>
          Effect.gen(function* () {
            const isDuplicate = existingFiles.some(
              (existing) => existing.filename === file.name,
            );

            if (isDuplicate) {
              yield* Effect.sync(() => {
                duplicates.push(file.name);
              });
            } else {
              yield* Effect.sync(() => {
                uniqueFiles.push(file);
              });
            }
          }),
        );

        // Show toast if duplicates were found
        if (duplicates.length > 0) {
          yield* Effect.sync(() => {
            toast.warning(
              duplicates.length === 1
                ? `"${duplicates[0]}" is already uploaded`
                : `${duplicates.length} files were skipped because they're already uploaded`,
            );
          });
        }

        // If no unique files remain, exit early
        if (uniqueFiles.length === 0) {
          return;
        }

        // Validate all files and separate valid/invalid with side effects
        const validFiles: File[] = [];

        yield* Effect.forEach(uniqueFiles, (file, index) =>
          Effect.gen(function* () {
            const result = yield* validateFile(file, config).pipe(
              Effect.either,
            );

            if (Either.isRight(result)) {
              // Valid file - collect it
              yield* Effect.sync(() => {
                validFiles.push(uniqueFiles[index]);
              });
            } else {
              // Invalid file - show error toast
              yield* Effect.sync(() => {
                toast.error(result.left.message);
              });
            }
          }),
        );

        // If no valid files, exit early
        if (validFiles.length === 0) {
          return;
        }

        // Create FileItem only for valid files
        const newFileItems: FileItem[] = yield* Effect.sync(() =>
          validFiles.map((file) => ({
            id: crypto.randomUUID(),
            filename: file.name,
            mediaType: file.type,
            url: undefined,
            status: "uploading" as const,
          })),
        );

        // Add valid files to state
        yield* Effect.sync(() => {
          setFiles((prev) => [...prev, ...newFileItems]);
        });

        // Upload valid files with concurrency limit of 5
        yield* Effect.forEach(
          validFiles.map((file, index) => ({
            file,
            fileItem: newFileItems[index],
          })),
          ({ file, fileItem }) =>
            Effect.gen(function* () {
              // Wrap upload in Either so failures don't propagate
              const uploadResult = yield* Effect.tryPromise({
                try: () => uploadFile(file),
                catch: (error) =>
                  new FileUploadError({
                    filename: file.name,
                    message: `Failed to upload ${file.name}: ${error}`,
                  }),
              }).pipe(Effect.retry({ times: 2 }), Effect.either);

              if (Either.isRight(uploadResult)) {
                // Upload succeeded - update state with URL
                const key = uploadResult.right;
                const url = `https://${env.NEXT_PUBLIC_R2_PUBLIC_DOMAIN}/${key}`;

                yield* Effect.sync(() =>
                  setFiles((prev) =>
                    prev.map((f) =>
                      f.id === fileItem.id
                        ? { ...f, url, status: "complete" as const }
                        : f,
                    ),
                  ),
                );
              } else {
                // Upload failed - remove from state and show error
                yield* Effect.sync(() => {
                  setFiles((prev) => prev.filter((f) => f.id !== fileItem.id));
                  toast.error(uploadResult.left.message);
                });
              }
            }),
          { concurrency: 5 },
        );
      });

      // Run the upload effect in background
      Effect.runFork(uploadEffect);
    },
    [files, config, uploadFile],
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
