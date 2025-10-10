export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
};

export const getFileExtension = (filename: string): string => {
  const parts = filename.split(".");
  return parts.length > 1 ? parts.pop()!.toLowerCase() : "";
};

export const truncateFilename = (filename: string, maxLength = 30): string => {
  if (filename.length <= maxLength) return filename;

  const ext = getFileExtension(filename);
  const nameWithoutExt = filename.slice(0, filename.lastIndexOf("."));
  const truncated = nameWithoutExt.slice(0, maxLength - ext.length - 4) + "...";

  return ext ? `${truncated}.${ext}` : truncated;
};
