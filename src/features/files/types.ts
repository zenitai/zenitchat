import { Data } from "effect";

// Custom error type for file validation using Data.TaggedError
export class FileValidationError extends Data.TaggedError(
  "FileValidationError",
)<{
  readonly filename: string;
  readonly message: string;
}> {}

// Custom error type for file upload using Data.TaggedError
export class FileUploadError extends Data.TaggedError("FileUploadError")<{
  readonly filename: string;
  readonly message: string;
}> {}

// Core file data structure
export interface FileItem {
  id: string; // Ephemeral client-side ID for React keys
  filename: string; // Display name
  mediaType: string; // MIME type (for icons, validation)
  url?: string; // Public R2 URL (undefined while uploading)
  status: "uploading" | "complete" | "marked-for-deletion";
}

// Component props = FileItem + callbacks
export interface FileItemProps extends FileItem {
  onRemove?: () => void; // Delete immediately (chat input)
  onMarkForDeletion?: () => void; // Mark for deletion (message edit)
  onRestore?: () => void; // Restore marked file (message edit)
  onClick?: () => void; // Open preview
}

// File validation configuration
export interface FileValidationConfig {
  maxSizeMB: number; // Maximum file size in megabytes (default: 8)
  allowedMIMETypes?: string[]; // From model.allowedMIMETypes
  maxFiles?: number; // Maximum files per message (default: 15)
}

// Return type for useFileUpload hook
export interface UseFileUploadReturn {
  files: FileItem[];
  addFiles: (files: FileList | File[]) => void;
  removeFile: (id: string) => void;
  markForDeletion: (id: string) => void;
  restoreFile: (id: string) => void;
  clearFiles: () => void;
}
