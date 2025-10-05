import { Effect } from "effect";
import type { StreamingMessageStore } from "../core/streaming-message-store";
import type { MyUIMessage } from "@/features/messages/types";
import type { ConvexFunctions } from "../hooks/use-convex-functions";
import type { MakeRequestError } from "./types";

/**
 * Handles MakeRequestError by updating store status and saving error to Convex
 *
 * When streaming fails due to a request error:
 * 1. Sets store status to "error"
 * 2. Reads any partial message content that streamed before the error
 * 3. Saves the partial content + detailed error metadata to Convex
 *
 * @param store - The streaming message store
 * @param assistantMessageId - The ID of the assistant message
 * @param selectedModel - The model being used (for metadata)
 * @param error - The MakeRequestError containing error details
 * @param convexFunctions - Convex mutations for saving
 * @returns Effect that handles the error
 */
export function handleMakeRequestError(
  store: StreamingMessageStore<MyUIMessage>,
  assistantMessageId: string,
  selectedModel: string,
  error: MakeRequestError,
  convexFunctions: ConvexFunctions,
) {
  return Effect.gen(function* () {
    store.status = "error";

    // Read the partial message from the store (contains any parts that streamed before error)
    const partialMessage = store.message;

    // Update the message with partial parts, error status, and error details in one call
    yield* convexFunctions.mutations.updateMessage({
      messageId: assistantMessageId,
      parts: partialMessage?.parts ?? [],
      generationStatus: "error",
      metadata: {
        ...partialMessage?.metadata,
        model: selectedModel,
        errors: [
          {
            type: error.type,
            reason: error.reason,
            message: error.message,
            timestamp: error.timestamp,
          },
        ],
      },
    });
  });
}
