import type { FileItem } from "../types";
import type { MyUIMessage } from "@/features/messages/types";

// Convert FileItems to FileParts for message sending
export const getFileParts = (files: FileItem[]) => {
  return files
    .filter((f) => f.status === "complete" && f.url)
    .map((f) => ({
      type: "file" as const,
      mediaType: f.mediaType,
      filename: f.filename,
      url: f.url!,
    }));
};

// Convert message FileParts to FileItems (for editing)
export const loadFilesFromMessage = (message?: MyUIMessage): FileItem[] => {
  if (!message) return [];

  return message.parts
    .filter((part) => part.type === "file")
    .map((part) => ({
      id: crypto.randomUUID(),
      filename: part.filename || "File",
      mediaType: part.mediaType,
      url: part.url,
      status: "complete" as const,
    }));
};
