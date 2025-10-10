export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.min(
    Math.floor(Math.log(bytes) / Math.log(k)),
    sizes.length - 1,
  );

  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
};

export const getFileExtension = (filename: string): string => {
  const lastDot = filename.lastIndexOf(".");
  if (lastDot <= 0 || lastDot === filename.length - 1) return "";
  return filename.slice(lastDot + 1).toLowerCase();
};

export const truncateFilename = (filename: string, maxLength = 30): string => {
  if (filename.length <= maxLength) return filename;

  const ext = getFileExtension(filename);
  const hasExt = ext.length > 0;
  const baseName = hasExt
    ? filename.slice(0, filename.length - ext.length - 1)
    : filename;
  const ellipsis = "...";
  const allowed = Math.max(
    1,
    maxLength - (hasExt ? ext.length + 1 : 0) - ellipsis.length,
  );
  const truncatedBase = baseName.slice(0, allowed) + ellipsis;
  return hasExt ? `${truncatedBase}.${ext}` : truncatedBase;
};
