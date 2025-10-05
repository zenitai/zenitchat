import { Effect } from "effect";
import { FetchHttpClient } from "@effect/platform";
import { chatFetcher } from "./request/chat-fetcher";
import { makeRequest } from "./request/make-request";
import {
  getOrCreateStreamingStore,
  resetStreamingStore,
} from "./core/streaming-registry";
import { convexMessagesToUIMessages } from "@/features/messages/utils";
import { getSelectedModel } from "@/features/chat-input/store";
import { messageMetadataSchema } from "@/features/messages/types";
import { handleInterrupt } from "./request/handle-interrupt";
import { handleMakeRequestError } from "./request/handle-error";
import type { MyUIMessage } from "@/features/messages/types";
import type { RegenerateMessageOptions } from "./types";

const regenerateMessageEffect = ({
  threadId,
  messageId,
  model,
  convexFunctions,
  store,
}: RegenerateMessageOptions) =>
  Effect.gen(function* () {
    // Get model from Zustand if not provided
    const selectedModel =
      model || (yield* Effect.sync(() => getSelectedModel().id));

    // Fetch thread messages
    const threadMessages =
      yield* convexFunctions.queries.fetchThreadMessages(threadId);
    const history = yield* Effect.sync(() =>
      convexMessagesToUIMessages(threadMessages),
    );

    // Find target assistant message
    const targetIndex = history.findIndex((msg) => msg.id === messageId);
    if (targetIndex === -1) {
      throw new Error(`Message ${messageId} not found`);
    }

    if (history[targetIndex].role !== "assistant") {
      throw new Error("Can only regenerate assistant messages");
    }

    // Get conversation history up to (but not including) this message
    const messagesToUse = history.slice(0, targetIndex);

    store.message = null;

    // Create new assistant message
    const assistantMessageId = crypto.randomUUID();
    const assistantMessage: MyUIMessage = {
      id: assistantMessageId,
      role: "assistant",
      parts: [],
      metadata: { model: selectedModel },
    };

    const messageForConvex = {
      messageId: assistantMessage.id,
      role: assistantMessage.role,
      parts: assistantMessage.parts,
      generationStatus: "submitted" as const,
      metadata: {
        model: selectedModel,
      },
    };

    // Immediately write seed message to store so it's available on interrupt
    store.message = assistantMessage;

    // Delete old messages and add new assistant message in one call
    yield* convexFunctions.mutations.regenerateFromMessage({
      threadId,
      fromMessageId: messageId,
      messagesToAdd: [messageForConvex],
    });

    // Stream the response
    const result = yield* makeRequest({
      store,
      seedMessage: assistantMessage,
      messages: messagesToUse,
      messageId: assistantMessage.id,
      messageMetadataSchema,
      fetchStream: () =>
        chatFetcher({
          messages: messagesToUse,
          model: selectedModel,
        }),
    }).pipe(
      Effect.tapErrorTag("MakeRequestError", (error) =>
        handleMakeRequestError(
          store,
          assistantMessageId,
          selectedModel,
          error,
          convexFunctions,
        ),
      ),
    );

    // Update the assistant message in Convex with the final result
    yield* convexFunctions.mutations.updateMessage({
      messageId: result.id,
      parts: result.parts,
      generationStatus: "ready",
      metadata: {
        ...result.metadata,
        errors: undefined,
      },
    });

    // Set status to ready after Convex save succeeds
    store.status = "ready";

    return result;
  }).pipe(
    Effect.onInterrupt(() => handleInterrupt(store, convexFunctions)),
    Effect.ensuring(Effect.sync(() => resetStreamingStore(threadId))),
    Effect.catchAll((error) =>
      Effect.sync(() => {
        console.error("Error occurred:", error);
        store.status = "error";
      }),
    ),
  );

export const regenerateMessage = (
  options: Omit<RegenerateMessageOptions, "store">,
): void => {
  const store = getOrCreateStreamingStore(options.threadId);
  store.status = "submitted";

  const fiber = Effect.runFork(
    regenerateMessageEffect({ ...options, store }).pipe(
      Effect.provide(FetchHttpClient.layer),
    ),
  );

  store.fiber = fiber;
};
