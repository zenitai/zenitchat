import { useState, useCallback } from "react";
import { useConvex, useMutation } from "convex/react";
import { toast } from "sonner";
import { Effect, Either } from "effect";
import { api } from "@/convex/_generated/api";
import { R2Service, makeConvexLayer } from "@/services/r2";
import { validateFile } from "../utils";
import {
  type FileItem,
  type FileValidationConfig,
  type UseFileUploadReturn,
} from "../types";

export const useFileUpload = (
  config: FileValidationConfig,
): UseFileUploadReturn => {
  const convex = useConvex();
  const [files, setFiles] = useState<FileItem[]>([]);
  const deleteFile = useMutation(api.files.deleteFile);

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
              const r2 = yield* R2Service;

              // Wrap upload in Either so failures don't propagate
              const uploadResult = yield* r2
                .uploadFile(file)
                .pipe(Effect.either);

              if (Either.isRight(uploadResult)) {
                // Upload succeeded - update state with URL
                const { publicUrl } = uploadResult.right;

                yield* Effect.sync(() =>
                  setFiles((prev) =>
                    prev.map((f) =>
                      f.id === fileItem.id
                        ? { ...f, url: publicUrl, status: "complete" as const }
                        : f,
                    ),
                  ),
                );
              } else {
                // Upload failed - remove from state and show error
                yield* Effect.sync(() => {
                  setFiles((prev) => prev.filter((f) => f.id !== fileItem.id));
                  const error = uploadResult.left;
                  // Show user-friendly message, log technical details
                  toast.error(error.message);
                  console.error(
                    `Upload error for ${error.filename}:`,
                    error.originalError,
                  );
                });
              }
            }).pipe(
              Effect.provide(R2Service.Default),
              Effect.provide(makeConvexLayer(convex)),
            ),
          { concurrency: 5 },
        );
      });

      // Run the upload effect in background
      Effect.runFork(uploadEffect);
    },
    [files, config, convex],
  );

  // Remove file from state and delete from R2
  const removeFile = useCallback(
    async (id: string) => {
      const file = files.find((f) => f.id === id);
      if (!file) return;

      // Remove from state immediately
      setFiles((prev) => prev.filter((f) => f.id !== id));

      // Delete from R2 if file has been uploaded
      if (file.url && file.status === "complete") {
        try {
          // Extract key from URL: https://domain.com/path/to/file -> path/to/file
          const url = new URL(file.url);
          const key = url.pathname.substring(1); // Remove leading slash
          if (key) {
            await deleteFile({ key });
          }
        } catch (error) {
          console.error("Failed to delete file from R2:", error);
          toast.error("Failed to delete file");
        }
      }
    },
    [files, deleteFile],
  );

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
