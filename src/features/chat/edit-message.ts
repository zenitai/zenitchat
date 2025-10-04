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
import type { MyUIMessage } from "@/features/messages/types";
import type { EditMessageOptions } from "./types";

const editMessageEffect = ({
  threadId,
  messageId,
  content,
  model,
  convexFunctions,
}: EditMessageOptions) =>
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

    // Find target user message
    const targetIndex = history.findIndex((msg) => msg.id === messageId);
    if (targetIndex === -1) {
      throw new Error(`Message ${messageId} not found`);
    }

    if (history[targetIndex].role !== "user") {
      throw new Error("Can only edit user messages");
    }

    // Get conversation history up to (but not including) this message
    const messagesToUse = history.slice(0, targetIndex);

    // Get streaming store
    const store = yield* Effect.sync(() => getOrCreateStreamingStore(threadId));
    store.message = null;

    // Create new user and assistant messages
    const newUserMessageId = crypto.randomUUID();
    const assistantMessageId = crypto.randomUUID();

    const newUserMessage: MyUIMessage = {
      id: newUserMessageId,
      role: "user",
      parts: [{ type: "text", text: content.trim() }],
      metadata: { model: selectedModel },
    };

    const assistantMessage: MyUIMessage = {
      id: assistantMessageId,
      role: "assistant",
      parts: [],
      metadata: { model: selectedModel },
    };

    const messagesForConvex = [
      {
        messageId: newUserMessage.id,
        role: newUserMessage.role,
        parts: newUserMessage.parts,
        generationStatus: "ready" as const,
        metadata: { model: selectedModel },
      },
      {
        messageId: assistantMessage.id,
        role: assistantMessage.role,
        parts: assistantMessage.parts,
        generationStatus: "submitted" as const,
        metadata: {
          model: selectedModel,
        },
      },
    ];

    // Delete old messages and add new messages in one call
    yield* convexFunctions.mutations.regenerateFromMessage({
      threadId,
      fromMessageId: messageId,
      messagesToAdd: messagesForConvex,
    });

    // Stream the response
    const result = yield* makeRequest({
      store,
      messages: [...messagesToUse, newUserMessage],
      messageId: assistantMessage.id,
      messageMetadataSchema,
      fetchStream: () =>
        chatFetcher({
          messages: [...messagesToUse, newUserMessage],
          model: selectedModel,
        }),
    }).pipe(
      Effect.tapErrorTag("MakeRequestError", (error) => {
        return Effect.gen(function* () {
          // Read the partial message from the store
          const partialMessage = store.message;

          // Update the message with partial parts, error status, and error details
          yield* convexFunctions.mutations.updateMessage({
            messageId: assistantMessage.id,
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
      }),
    );

    // Update the assistant message in Convex with the final result
    yield* convexFunctions.mutations.updateMessage({
      messageId: assistantMessage.id,
      parts: result.parts,
      generationStatus: "ready",
      metadata: {
        ...result.metadata,
        model: selectedModel,
        errors: undefined,
      },
    });

    return result;
  }).pipe(
    Effect.ensuring(Effect.sync(() => resetStreamingStore(threadId))),
    Effect.catchAll((error) => {
      return Effect.gen(function* () {
        console.error("Error occurred:", error);
      });
    }),
  );

export const editMessage = (options: EditMessageOptions) =>
  Effect.runPromise(
    editMessageEffect(options).pipe(Effect.provide(FetchHttpClient.layer)),
  );
