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
  messages: z.array(z.any()),
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
        throw new Error("Request body validation failed");
      }

      return parseResult.data;
    },
    catch: (error) =>
      new ValidationError({
        reason: "Invalid request structure",
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
