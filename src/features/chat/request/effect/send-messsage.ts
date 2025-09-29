import { Effect } from "effect";
import { FetchHttpClient } from "@effect/platform";
import { chatFetcher } from "./chat-fetcher";
import { makeRequest } from "./make-request";
import { getOrCreateStreamingStore } from "../../core/streaming-registry";
import { convexMessagesToUIMessages } from "@/features/messages/utils";
import type { MyUIMessage } from "@/features/messages/types";
import type { SendMessageOptions } from "./types";

const createMessagesToAdd = (content: string, model: string) =>
  Effect.sync(() => {
    const userMessageId = crypto.randomUUID();
    const assistantMessageId = crypto.randomUUID();

    const userMessage: MyUIMessage = {
      id: userMessageId,
      role: "user",
      parts: [{ type: "text", text: content.trim() }],
      metadata: {},
    };

    const assistantMessage: MyUIMessage = {
      id: assistantMessageId,
      role: "assistant",
      parts: [],
      metadata: { model },
    };

    return {
      userMessage,
      assistantMessage,
    };
  });

const sendMessageEffect = ({
  threadId,
  content,
  model,
  isNewThread,
  convexFunctions,
}: SendMessageOptions) =>
  Effect.gen(function* () {
    const store = yield* Effect.sync(() => getOrCreateStreamingStore(threadId));
    store.message = null;

    const { userMessage, assistantMessage } = yield* createMessagesToAdd(
      content,
      model,
    );

    // Create thread if it's a new thread
    if (isNewThread) {
      yield* convexFunctions.mutations.createThread({
        threadId,
        title: "New thread",
        model,
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
    }

    // Add both user and assistant messages to Convex in single call
    yield* convexFunctions.mutations.addMessagesToThread({
      threadId,
      messages: [
        {
          messageId: userMessage.id,
          role: userMessage.role,
          parts: userMessage.parts,
          generationStatus: "ready",
          metadata: userMessage.metadata,
        },
        {
          messageId: assistantMessage.id,
          role: assistantMessage.role,
          parts: assistantMessage.parts,
          generationStatus: "submitted",
          metadata: assistantMessage.metadata,
        },
      ],
    });

    const result = yield* makeRequest({
      store,
      messages: [...history, userMessage],
      messageId: assistantMessage.id,
      fetchStream: () =>
        chatFetcher({
          messages: [...history, userMessage],
          model,
        }),
    }).pipe(
      Effect.tapErrorTag("MakeRequestError", (error) => {
        return Effect.gen(function* () {
          // Read the partial message from the store (contains any parts that streamed before error)
          const partialMessage = store.message;

          // Update the message with partial parts, error status, and error details in one call
          yield* convexFunctions.mutations.updateMessage({
            messageId: assistantMessage.id,
            threadId,
            parts: partialMessage?.parts ?? [],
            generationStatus: "error",
            metadata: {
              ...partialMessage?.metadata,
              model,
              errors: [
                {
                  type: error.type,
                  reason: error.reason,
                  message: error.message,
                  originalError: error.originalError,
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
      threadId,
      parts: result.parts,
      generationStatus: "ready",
      metadata: {
        ...result.metadata,
        model,
        errors: undefined,
      },
    });

    return result;
  }).pipe(
    Effect.catchAll((error) => {
      return Effect.gen(function* () {
        console.error("Error occurred:", error);
      });
    }),
  );

export const sendMessage = (options: SendMessageOptions) =>
  Effect.runPromise(
    sendMessageEffect(options).pipe(Effect.provide(FetchHttpClient.layer)),
  );
