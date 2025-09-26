import {
  clearStreamingStore,
  getOrCreateStreamingStore,
} from "./core/streaming-registry";
import { makeRequest } from "./request/make-request";
import { defaultChatFetcher } from "./request/chat-fetcher";
import type { MyUIMessage } from "@/features/messages/types";
import { convexMessagesToUIMessages } from "@/features/messages/utils";
import type { MakeRequestFinishEvent } from "./request/types";
import type { ConvexFunctions } from "./hooks/use-convex-functions";

interface SendMessageParams {
  threadId: string;
  content: string;
  model: string;
  metadata?: MyUIMessage["metadata"];
  signal?: AbortSignal;
  onProgress?: (event: MakeRequestFinishEvent) => void;
  isNewThread?: boolean;
}

export async function sendMessage(
  {
    threadId,
    content,
    model,
    metadata,
    signal,
    onProgress,
    isNewThread,
  }: SendMessageParams,
  convexFunctions: ConvexFunctions,
) {
  if (!content.trim()) {
    throw new Error("Message content cannot be empty");
  }

  if (!threadId) {
    throw new Error("Thread ID is required to send a message");
  }

  const store = getOrCreateStreamingStore(threadId);
  store.message = null;

  const userMessageId = crypto.randomUUID();
  const assistantMessageId = crypto.randomUUID();

  let finalResult: MakeRequestFinishEvent;

  try {
    // Create user message
    const userMessage: MyUIMessage = {
      id: userMessageId,
      role: "user",
      parts: [{ type: "text", text: content.trim() }],
      metadata: metadata || {},
    };

    // Create initial assistant message
    const assistantMessage: MyUIMessage = {
      id: assistantMessageId,
      role: "assistant",
      parts: [],
      metadata: { model },
    };

    // Create thread only if it's a new thread
    if (isNewThread) {
      try {
        await convexFunctions.mutations.createThread({
          threadId,
          title: "New thread",
          model,
        });
      } catch (error) {
        console.warn("Thread creation failed:", error);
        throw new Error("Failed to create thread");
      }
    }

    // Add both user and assistant messages to Convex in single call
    try {
      await convexFunctions.mutations.addMessagesToThread({
        threadId,
        messages: [
          {
            messageId: userMessageId,
            role: "user",
            parts: userMessage.parts,
            metadata: userMessage.metadata,
          },
          {
            messageId: assistantMessageId,
            role: "assistant",
            parts: assistantMessage.parts,
            generationStatus: "streaming",
            metadata: assistantMessage.metadata,
          },
        ],
      });
    } catch (error) {
      console.error("Failed to add messages:", error);
      throw new Error("Failed to save messages");
    }

    // Update thread status to streaming
    try {
      await convexFunctions.mutations.updateThread({
        threadId,
        generationStatus: "streaming",
      });
    } catch (error) {
      console.warn("Failed to update thread status:", error);
    }

    // Fetch thread messages for history
    let history: MyUIMessage[] = [];
    if (!isNewThread) {
      try {
        const threadMessages =
          await convexFunctions.queries.fetchThreadMessages(threadId);
        history = convexMessagesToUIMessages(threadMessages);
      } catch (error) {
        console.warn("Failed to fetch thread messages:", error);
        // Continue with empty history
      }
    }

    // Prepare messages for API request
    const messagesForRequest: MyUIMessage[] = [...history, userMessage];

    // Make the streaming request
    finalResult = await makeRequest({
      store,
      messages: messagesForRequest,
      messageId: assistantMessageId,
      signal,
      fetchStream: async ({ signal: fetchSignal }) =>
        defaultChatFetcher({
          messages: messagesForRequest,
          model,
          signal: fetchSignal,
        }),
      onFinish: async (event) => {
        // Update assistant message in Convex with final content
        try {
          const generationStatus = event.isError
            ? "error"
            : event.isDisconnect
              ? "error"
              : event.isAbort
                ? "ready"
                : "ready";

          await convexFunctions.mutations.updateMessage({
            messageId: assistantMessageId,
            parts: event.message.parts,
            generationStatus,
            metadata: {
              ...event.message.metadata,
              model,
            },
          });

          await convexFunctions.mutations.updateThread({
            threadId,
            generationStatus:
              event.isError || event.isDisconnect ? "error" : "ready",
          });

          onProgress?.(event);
        } catch (updateError) {
          console.error(
            "Failed to update message after completion:",
            updateError,
          );
        }
      },
      onError: async (error) => {
        try {
          await convexFunctions.mutations.setMessageError({
            messageId: assistantMessageId,
            error: {
              type: "unknown",
              message: error instanceof Error ? error.message : String(error),
              timestamp: Date.now(),
            },
          });

          await convexFunctions.mutations.updateThread({
            threadId,
            generationStatus: "error",
          });
        } catch (saveError) {
          console.error("Failed to save error to Convex:", saveError);
        }
      },
    });

    return finalResult;
  } catch (error) {
    console.error("Streaming request failed:", error);

    try {
      await convexFunctions.mutations.setMessageError({
        messageId: assistantMessageId,
        error: {
          type:
            error instanceof Error && error.name === "AbortError"
              ? "timeout"
              : "network_error",
          message: error instanceof Error ? error.message : String(error),
          timestamp: Date.now(),
        },
      });

      await convexFunctions.mutations.updateThread({
        threadId,
        generationStatus: "error",
      });
    } catch (saveError) {
      console.error("Failed to save streaming error:", saveError);
    }

    throw error;
  } finally {
    store.message = null;
    clearStreamingStore(threadId);
  }
}
