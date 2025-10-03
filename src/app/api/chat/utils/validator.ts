import { Effect, Data } from "effect";
import { z } from "zod";
import { validateUIMessages } from "ai";
import { ALL_MODELS } from "@/features/models";

// ============================================================================
// ERRORS
// ============================================================================

export class ValidationError extends Data.TaggedError("ValidationError")<{
  readonly reason: string;
  readonly message: string;
  readonly details?: unknown;
}> {}

// ============================================================================
// SCHEMAS
// ============================================================================

/**
 * Request body schema - validates structure before AI SDK validation
 */
const RequestBodySchema = z.object({
  messages: z.array(z.any()).min(1, "No messages provided"),
  model: z.string().refine((val) => ALL_MODELS.some((m) => m.id === val), {
    message: "Invalid model",
  }),
});

// ============================================================================
// VALIDATORS
// ============================================================================

/**
 * Validates the request body structure
 */
export const validateRequestBody = (rawBody: unknown) =>
  Effect.try({
    try: () => {
      const parseResult = RequestBodySchema.safeParse(rawBody);

      if (!parseResult.success) {
        // Extract specific error messages from Zod
        const errors = parseResult.error.issues;
        const errorMessages = errors.map((err) => err.message);

        // Check for combined validation case
        const hasInvalidModel = errorMessages.some(
          (msg) => msg === "Invalid model",
        );
        const hasNoMessages = errorMessages.some(
          (msg) => msg === "No messages provided",
        );

        let reason: string;
        if (hasInvalidModel && hasNoMessages) {
          reason = "Invalid model and no messages provided";
        } else if (hasInvalidModel) {
          reason = "Invalid model";
        } else if (hasNoMessages) {
          reason = "No messages provided";
        } else {
          reason = "Invalid request structure";
        }

        throw new Error(reason);
      }

      return parseResult.data;
    },
    catch: (error) =>
      new ValidationError({
        reason:
          error instanceof Error ? error.message : "Invalid request structure",
        message:
          error instanceof Error
            ? error.message
            : "Request body validation failed",
        details: error,
      }),
  });

/**
 * Validates UI messages using AI SDK's built-in validator
 */
export const validateMessages = (messages: unknown) =>
  Effect.tryPromise({
    try: () => validateUIMessages({ messages }),
    catch: (error) =>
      new ValidationError({
        reason: "Invalid message format",
        message:
          error instanceof Error ? error.message : "Message validation failed",
        details: error,
      }),
  });
