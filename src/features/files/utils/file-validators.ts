import { Effect } from "effect";
import { FileValidationError } from "../types";
import type { FileValidationConfig } from "../types";

export const validateFile = (file: File, config: FileValidationConfig) => {
  return Effect.try({
    try: () => {
      // Check file size
      const maxBytes = config.maxSizeMB * 1024 * 1024;
      if (file.size > maxBytes) {
        throw new Error(
          `File "${file.name}" exceeds ${config.maxSizeMB}MB limit`,
        );
      }

      // Check MIME type if specified
      if (config.allowedMIMETypes && config.allowedMIMETypes.length > 0) {
        if (!config.allowedMIMETypes.includes(file.type)) {
          throw new Error(
            `This model does not support files of type "${file.type}"`,
          );
        }
      }
    },
    catch: (error) => {
      return new FileValidationError({
        filename: file.name,
        message:
          error instanceof Error
            ? error.message
            : `Validation failed for "${file.name}"`,
      });
    },
  });
};

export const validateFiles = (files: File[], config: FileValidationConfig) => {
  return Effect.forEach(files, (file) => validateFile(file, config));
};
