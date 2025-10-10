import type { LucideIcon } from "lucide-react";
import {
  FileImage,
  FileText,
  FileType2,
  FileVideo,
  FileAudio,
  File,
  Sheet,
  Presentation,
} from "lucide-react";

export const isImage = (mediaType: string): boolean => {
  return mediaType.startsWith("image/");
};

export const isPDF = (mediaType: string): boolean => {
  return mediaType === "application/pdf";
};

export const isVideo = (mediaType: string): boolean => {
  return mediaType.startsWith("video/");
};

export const isAudio = (mediaType: string): boolean => {
  return mediaType.startsWith("audio/");
};

export const isText = (mediaType: string): boolean => {
  return mediaType.startsWith("text/");
};

// Get appropriate icon based on MIME type
export const getFileIcon = (mediaType: string): LucideIcon => {
  if (isImage(mediaType)) return FileImage;
  if (isPDF(mediaType)) return FileText;
  if (isVideo(mediaType)) return FileVideo;
  if (isAudio(mediaType)) return FileAudio;
  if (isText(mediaType)) return FileType2;

  // Check for specific document types
  if (mediaType.includes("word") || mediaType.includes("document")) {
    return FileText;
  }
  if (mediaType.includes("sheet") || mediaType.includes("excel")) {
    return Sheet;
  }
  if (mediaType.includes("presentation") || mediaType.includes("powerpoint")) {
    return Presentation;
  }

  return File; // Default
};
