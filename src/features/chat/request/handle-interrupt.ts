import { Effect } from "effect";
import type { StreamingMessageStore } from "../core/streaming-message-store";
import type { MyUIMessage } from "@/features/messages/types";
import type { ConvexFunctions } from "../hooks/use-convex-functions";

/**
 * Handles interruption (abort/stop) of streaming messages
 *
 * When a user stops generation:
 * 1. Updates the store immediately with abort error for instant UI feedback
 * 2. Marks all parts as "done" to prevent UI from showing "waiting" state
 * 3. Saves the partial message to Convex with error details
 *
 * @param store - The streaming message store
 * @param convexFunctions - Convex mutations for saving
 * @returns Effect that handles the interrupt
 */
export function handleInterrupt(
  store: StreamingMessageStore<MyUIMessage>,
  convexFunctions: ConvexFunctions,
) {
  return Effect.gen(function* () {
    const partialMessage = store.message;

    // Always save abort error so user knows generation was stopped
    if (partialMessage) {
      // Mark all parts as "done" to prevent UI from showing "waiting" state
      const partsWithDoneState = partialMessage.parts.map((part) => {
        if ("state" in part && part.state === "streaming") {
          return { ...part, state: "done" as const };
        }
        return part;
      });

      // Update store immediately so UI shows error without waiting for Convex
      store.message = {
        ...partialMessage,
        parts: partsWithDoneState,
        metadata: {
          ...partialMessage.metadata,
          errors: [{ message: "Generation was stopped by user" }],
        },
      };

      // Save to Convex with full error details
      yield* convexFunctions.mutations.updateMessage({
        messageId: partialMessage.id,
        parts: partsWithDoneState,
        generationStatus: "error",
        metadata: {
          ...partialMessage.metadata,
          errors: [
            {
              type: "abort",
              reason: "Generation was stopped by user",
              message: "Generation was stopped by user",
              timestamp: Date.now(),
            },
          ],
        },
      });
    }
  }).pipe(
    Effect.catchAll((error) =>
      Effect.sync(() => {
        console.error("Failed to save partial message on interrupt:", error);
      }),
    ),
  );
}
