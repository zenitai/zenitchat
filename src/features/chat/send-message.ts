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
import type { SendMessageOptions } from "./types";

const createMessagesToAdd = (content: string, selectedModel: string) =>
  Effect.sync(() => {
    const userMessageId = crypto.randomUUID();
    const assistantMessageId = crypto.randomUUID();

    const userMessage: MyUIMessage = {
      id: userMessageId,
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

    // Structured messages for Convex insertion
    const messagesForConvex = [
      {
        messageId: userMessage.id,
        role: userMessage.role,
        parts: userMessage.parts,
        generationStatus: "ready" as const,
        metadata: { model: selectedModel },
      },
      {
        messageId: assistantMessage.id,
        role: assistantMessage.role,
        parts: assistantMessage.parts,
        generationStatus: "submitted" as const,
        metadata: { model: selectedModel },
      },
    ];

    return {
      userMessage,
      assistantMessage,
      messagesForConvex,
    };
  });

const sendMessageEffect = ({
  threadId,
  content,
  model,
  isNewThread,
  convexFunctions,
  store,
}: SendMessageOptions) =>
  Effect.gen(function* () {
    // Get model from Zustand if not provided
    const selectedModel =
      model || (yield* Effect.sync(() => getSelectedModel().id));

    store.message = null;

    const { userMessage, assistantMessage, messagesForConvex } =
      yield* createMessagesToAdd(content, selectedModel);

    // Create thread if it's a new thread
    if (isNewThread) {
      yield* convexFunctions.mutations.createThreadWithMessages({
        threadId,
        title: "New thread",
        model: selectedModel,
        messages: messagesForConvex,
      });
    }

    // Fetch thread messages for history
    let history: MyUIMessage[] = [];
    if (!isNewThread) {
      const threadMessages =
        yield* convexFunctions.queries.fetchThreadMessages(threadId);
      history = yield* Effect.sync(() =>
        convexMessagesToUIMessages(threadMessages),
      );

      // Add both user and assistant messages to Convex in single call
      yield* convexFunctions.mutations.addMessagesToThread({
        threadId,
        messages: messagesForConvex,
      });
    }

    const result = yield* makeRequest({
      store,
      messages: [...history, userMessage],
      messageId: assistantMessage.id,
      messageMetadataSchema,
      fetchStream: () =>
        chatFetcher({
          messages: [...history, userMessage],
          model: selectedModel,
        }),
    }).pipe(
      Effect.tapErrorTag("MakeRequestError", (error) => {
        return Effect.gen(function* () {
          store.status = "error";

          // Read the partial message from the store (contains any parts that streamed before error)
          const partialMessage = store.message;

          // Update the message with partial parts, error status, and error details in one call
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

    // Set status to ready after Convex save succeeds
    store.status = "ready";

    // Clear the streaming store after saving to Convex
    yield* Effect.sync(() => resetStreamingStore(threadId));

    return result;
  }).pipe(
    Effect.catchAll((error) => {
      return Effect.gen(function* () {
        console.error("Error occurred:", error);
        store.status = "error";
      });
    }),
  );

export const sendMessage = (
  options: Omit<SendMessageOptions, "store">,
): void => {
  const store = getOrCreateStreamingStore(options.threadId);
  store.status = "submitted";

  const fiber = Effect.runFork(
    sendMessageEffect({ ...options, store }).pipe(
      Effect.provide(FetchHttpClient.layer),
    ),
  );

  store.fiber = fiber;
};
