import { useQuery } from "convex-helpers/react/cache/hooks";
import { api } from "@/convex/_generated/api";
import { useStreamingAssistant } from "./use-streaming-assistant";
import { convexMessagesToUIMessages } from "@/features/messages/utils";
import type { MyUIMessage } from "@/features/messages/types";

/**
 * Hook that returns the display messages for a thread
 *
 * Priority order:
 * 1. If pendingUserMessage exists (before Convex sync), append it + streaming assistant
 * 2. If streaming, replace/append streaming assistant message
 * 3. Otherwise, return Convex messages as-is
 */
export function useDisplayMessages(
  threadId: string | undefined,
): MyUIMessage[] {
  // Get messages from Convex (skip query if no threadId)
  const convexMessages = useQuery(
    api.messages.getThreadMessages,
    threadId ? { threadId } : "skip",
  );

  // Get streaming message and pending user message (always call hook, but pass empty string if no threadId)
  const { streamingMessage, pendingUserMessage } = useStreamingAssistant(
    threadId ?? "",
  );

  // Convert Convex messages to UI messages
  const convexUIMessages = convexMessages
    ? convexMessagesToUIMessages(convexMessages)
    : [];

  // Build base messages
  let messages = convexUIMessages;

  // Add pending user message if exists AND not already in Convex (avoid duplicates from optimistic updates)
  if (pendingUserMessage) {
    const alreadyInConvex = convexUIMessages.some(
      (msg) => msg.id === pendingUserMessage.id,
    );
    if (!alreadyInConvex) {
      messages = [...messages, pendingUserMessage];
    }
  }

  // Handle streaming assistant message
  if (streamingMessage) {
    const placeholderIndex = messages.findIndex(
      (message) => message.id === streamingMessage.id,
    );

    if (placeholderIndex >= 0) {
      // Replace placeholder with streaming message
      const updatedMessages = messages.slice();
      updatedMessages[placeholderIndex] = streamingMessage;
      return updatedMessages;
    }

    // Append streaming message if not found
    return [...messages, streamingMessage];
  }

  return messages;
}
